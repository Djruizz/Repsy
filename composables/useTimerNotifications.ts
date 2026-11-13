import { ref, computed, watch } from 'vue'
import { buildWavBlobUrl } from '~/composables/useSoundCue'
import { formatTime } from '~/composables/useTimer'

const NOTIF_KEY = 'gymapp:notifications'
const LOCKSCREEN_KEY = 'gymapp:lockScreenTimer'
const WAKELOCK_KEY = 'gymapp:wakeLock'

const PROGRESS_TAG = 'repsy-timer-progress'
const DONE_TAG = 'repsy-timer-done'

export type NotificationPermissionState = NotificationPermission | 'unsupported'

export interface TimerLockScreenInfo {
  title: string
  subtitle: string
  remainingSec: number
  totalSec: number
  running: boolean
  endAt?: number | null
}

export interface LockScreenHandlers {
  onPause?: () => void
  onResume?: () => void
  onSkip?: () => void
}

type ExtendedNotificationOptions = NotificationOptions & {
  renotify?: boolean
  vibrate?: number[]
}

const notificationsEnabled = ref(false)
const lockScreenEnabled = ref(true)
const wakeLockEnabled = ref(true)
const permission = ref<NotificationPermissionState>('default')

let prefsInitialized = false
let silentAudioUrl: string | null = null
let silentAudio: HTMLAudioElement | null = null
let lockScreenActive = false
let lastProgressNotifAt = 0
let lastMetadataKey = ''

let wakeLockSentinel: WakeLockSentinel | null = null
let wakeLockDesired = false
let wakeLockVisibilityBound = false

function readBool(key: string, fallback: boolean): boolean {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return raw === '1'
  } catch {
    return fallback
  }
}

function writeBool(key: string, value: boolean) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, value ? '1' : '0')
  } catch {
    /* ignore storage errors */
  }
}

function syncPermission() {
  if (typeof Notification === 'undefined') {
    permission.value = 'unsupported'
    return
  }
  permission.value = Notification.permission
}

function initPrefs() {
  if (prefsInitialized) return
  prefsInitialized = true
  notificationsEnabled.value = readBool(NOTIF_KEY, false)
  lockScreenEnabled.value = readBool(LOCKSCREEN_KEY, true)
  wakeLockEnabled.value = readBool(WAKELOCK_KEY, true)
  syncPermission()

  watch(notificationsEnabled, (v) => writeBool(NOTIF_KEY, v))
  watch(lockScreenEnabled, (v) => {
    writeBool(LOCKSCREEN_KEY, v)
    if (!v && lockScreenActive) stopLockScreenSession()
  })
  watch(wakeLockEnabled, (v) => {
    writeBool(WAKELOCK_KEY, v)
    if (!v) void releaseWakeLock()
  })
}

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return true
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    nav.standalone === true
  )
}

function getSilentAudio(): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null
  if (silentAudio) return silentAudio

  // 1 segundo de silencio PCM 16-bit con dither mínimo (±1) para evitar
  // que WebKit suspenda la sesión al detectar un buffer todo en ceros.
  const sampleRate = 8000
  const samples = new Int16Array(sampleRate)
  for (let i = 0; i < samples.length; i++) {
    samples[i] = i % 2 === 0 ? 1 : -1
  }
  silentAudioUrl = buildWavBlobUrl(samples, sampleRate)
  if (!silentAudioUrl) return null

  const audio = new Audio(silentAudioUrl)
  audio.loop = true
  audio.volume = 0.01
  audio.preload = 'auto'
  audio.setAttribute('playsinline', '')
  audio.addEventListener('ended', () => {
    if (lockScreenActive) {
      audio.currentTime = 0
      void audio.play().catch(() => {})
    }
  })
  silentAudio = audio
  return silentAudio
}

function setIosAudioSession(mode: 'playback' | 'ambient') {
  if (typeof navigator === 'undefined') return
  const nav = navigator as Navigator & { audioSession?: { type: string } }
  if (!nav.audioSession) return
  try {
    nav.audioSession.type = mode
  } catch {
    /* ignore unsupported mode */
  }
}

async function getSwRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null
  try {
    const existing = await navigator.serviceWorker.getRegistration()
    if (existing) return existing
    if (!navigator.serviceWorker.controller) return null
    return await Promise.race<ServiceWorkerRegistration | null>([
      navigator.serviceWorker.ready,
      new Promise((resolve) => setTimeout(() => resolve(null), 400)),
    ])
  } catch {
    return null
  }
}

async function dispatchNotification(
  title: string,
  options: ExtendedNotificationOptions,
) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  const payload: ExtendedNotificationOptions = {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    ...options,
  }
  const reg = await getSwRegistration()
  if (reg?.showNotification) {
    try {
      await reg.showNotification(title, payload)
      return
    } catch {
      /* fallback to window Notification */
    }
  }
  try {
    new Notification(title, payload)
  } catch {
    /* some mobile contexts forbid direct Notification constructor */
  }
}

export async function clearProgressNotification() {
  const reg = await getSwRegistration()
  if (!reg?.getNotifications) return
  try {
    const active = await reg.getNotifications({ tag: PROGRESS_TAG })
    for (const n of active) n.close()
  } catch {
    /* ignore */
  }
}

export async function notifyTimerFinished(title: string, body: string) {
  initPrefs()
  await clearProgressNotification()
  if (!notificationsEnabled.value || permission.value !== 'granted') return
  await dispatchNotification(title, {
    body,
    tag: DONE_TAG,
    renotify: true,
    silent: false,
    vibrate: [200, 100, 200],
  })
}

export function updateProgressNotification(info: TimerLockScreenInfo) {
  initPrefs()
  if (!notificationsEnabled.value || permission.value !== 'granted') return
  if (typeof document === 'undefined' || document.visibilityState !== 'hidden') return
  if (!info.running) return

  const now = Date.now()
  // Evitar rate-limiting de Android (máx. ~1 actualización cada 5s)
  if (now - lastProgressNotifAt < 5000) return
  lastProgressNotifAt = now

  const endStr = info.endAt
    ? new Date(info.endAt).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : ''
  const body = endStr
    ? `${info.subtitle} · Termina a las ${endStr}`
    : info.subtitle

  void dispatchNotification(`${formatTime(info.remainingSec)} · ${info.title}`, {
    body,
    tag: PROGRESS_TAG,
    silent: true,
    renotify: false,
  })
}

export function startLockScreenSession(handlers: LockScreenHandlers) {
  initPrefs()
  if (!lockScreenEnabled.value) return

  lockScreenActive = true
  setIosAudioSession('playback')

  const audio = getSilentAudio()
  if (audio && audio.paused) {
    void audio.play().catch(() => {
      /* Puede fallar si se restaura sin gesto previo tras recarga */
    })
  }

  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
    const ms = navigator.mediaSession
    const safeBind = (action: MediaSessionAction, fn?: () => void) => {
      try {
        ms.setActionHandler(action, fn ?? null)
      } catch {
        /* action not supported in this browser */
      }
    }
    safeBind('play', handlers.onResume)
    safeBind('pause', handlers.onPause)
    safeBind('nexttrack', handlers.onSkip)
    safeBind('previoustrack', handlers.onSkip)
  }
}

export function updateLockScreenMetadata(info: TimerLockScreenInfo) {
  initPrefs()
  if (!lockScreenActive || !lockScreenEnabled.value) {
    if (info.running && document?.visibilityState === 'hidden') {
      updateProgressNotification(info)
    }
    return
  }

  // Si está pausado/reanudado tras recarga, intentar reactivar audio si el navegador deja
  const audio = getSilentAudio()
  if (info.running && audio && audio.paused) {
    void audio.play().catch(() => {})
  }

  const key = `${info.title}|${info.subtitle}|${info.remainingSec}|${info.running}`
  if (key === lastMetadataKey) return
  lastMetadataKey = key

  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
    const ms = navigator.mediaSession
    if (typeof MediaMetadata !== 'undefined') {
      try {
        ms.metadata = new MediaMetadata({
          title: `${formatTime(info.remainingSec)} · ${info.title}`,
          artist: info.subtitle,
          album: 'Repsy',
          artwork: [
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        })
      } catch {
        /* ignore metadata errors */
      }
    }
    try {
      ms.playbackState = info.running ? 'playing' : 'paused'
      if (typeof ms.setPositionState === 'function' && info.totalSec > 0) {
        const duration = Math.max(1, info.totalSec)
        const position = Math.min(duration, Math.max(0, duration - info.remainingSec))
        ms.setPositionState({
          duration,
          playbackRate: info.running ? 1 : 0,
          position,
        })
      }
    } catch {
      /* ignore position state errors */
    }
  }

  updateProgressNotification(info)
}

export function stopLockScreenSession() {
  lockScreenActive = false
  lastMetadataKey = ''
  lastProgressNotifAt = 0

  if (silentAudio && !silentAudio.paused) {
    silentAudio.pause()
    silentAudio.currentTime = 0
  }

  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
    const ms = navigator.mediaSession
    for (const action of ['play', 'pause', 'nexttrack', 'previoustrack'] as MediaSessionAction[]) {
      try {
        ms.setActionHandler(action, null)
      } catch {
        /* ignore */
      }
    }
    try {
      ms.metadata = null
      ms.playbackState = 'none'
    } catch {
      /* ignore */
    }
  }

  setIosAudioSession('ambient')
  void clearProgressNotification()
}

async function requestSentinel() {
  if (!wakeLockDesired || !wakeLockEnabled.value) return
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
  if (wakeLockSentinel && !wakeLockSentinel.released) return

  try {
    const sentinel = await navigator.wakeLock.request('screen')
    wakeLockSentinel = sentinel
    sentinel.addEventListener('release', () => {
      if (wakeLockSentinel === sentinel) wakeLockSentinel = null
    })
  } catch {
    /* Battery saver / permission denied */
  }
}

function onWakeLockVisibility() {
  if (document.visibilityState === 'visible' && wakeLockDesired) {
    void requestSentinel()
  }
}

export async function acquireWakeLock() {
  initPrefs()
  wakeLockDesired = true
  if (!wakeLockVisibilityBound && typeof document !== 'undefined') {
    wakeLockVisibilityBound = true
    document.addEventListener('visibilitychange', onWakeLockVisibility)
  }
  await requestSentinel()
}

export async function releaseWakeLock() {
  wakeLockDesired = false
  if (wakeLockVisibilityBound && typeof document !== 'undefined') {
    wakeLockVisibilityBound = false
    document.removeEventListener('visibilitychange', onWakeLockVisibility)
  }
  if (wakeLockSentinel && !wakeLockSentinel.released) {
    try {
      await wakeLockSentinel.release()
    } catch {
      /* ignore */
    }
  }
  wakeLockSentinel = null
}

export async function requestNotificationPermission(): Promise<{
  ok: boolean
  reason?: 'ios-install-required' | 'unsupported' | 'denied'
}> {
  initPrefs()
  if (typeof Notification === 'undefined') {
    permission.value = 'unsupported'
    notificationsEnabled.value = false
    if (isIosDevice() && !isStandalonePwa()) {
      return { ok: false, reason: 'ios-install-required' }
    }
    return { ok: false, reason: 'unsupported' }
  }

  try {
    const res = await Notification.requestPermission()
    permission.value = res
    if (res === 'granted') {
      notificationsEnabled.value = true
      return { ok: true }
    }
    notificationsEnabled.value = false
    return { ok: false, reason: 'denied' }
  } catch {
    syncPermission()
    notificationsEnabled.value = false
    return { ok: false, reason: 'unsupported' }
  }
}

export function useTimerNotifications() {
  initPrefs()

  const canNotify = computed(
    () => notificationsEnabled.value && permission.value === 'granted',
  )

  async function toggleNotifications() {
    if (canNotify.value) {
      notificationsEnabled.value = false
      await clearProgressNotification()
      return { ok: true, enabled: false as const }
    }
    const res = await requestNotificationPermission()
    return { ...res, enabled: res.ok }
  }

  function toggleLockScreen() {
    lockScreenEnabled.value = !lockScreenEnabled.value
  }

  function toggleWakeLock() {
    wakeLockEnabled.value = !wakeLockEnabled.value
  }

  return {
    notificationsEnabled,
    lockScreenEnabled,
    wakeLockEnabled,
    permission,
    canNotify,
    isIosDevice,
    isStandalonePwa,
    requestNotificationPermission,
    toggleNotifications,
    toggleLockScreen,
    toggleWakeLock,
    notifyTimerFinished,
    clearProgressNotification,
    startLockScreenSession,
    updateLockScreenMetadata,
    stopLockScreenSession,
    acquireWakeLock,
    releaseWakeLock,
  }
}
