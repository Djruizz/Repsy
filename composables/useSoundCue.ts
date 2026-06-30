import { ref, watch } from 'vue'

const STORAGE_KEY = 'gymapp:soundMuted'

const muted = ref<boolean>(false)
let initialized = false

let ctx: AudioContext | null = null

function loadInitial() {
  if (initialized || typeof localStorage === 'undefined') return
  initialized = true
  try {
    muted.value = localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    muted.value = false
  }
  watch(muted, (v) => {
    try {
      localStorage.setItem(STORAGE_KEY, v ? '1' : '0')
    } catch {
      /* ignore quota / privacy errors */
    }
  })
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') {
    void ctx.resume()
  }
  return ctx
}

function tone(
  frequency: number,
  startOffsetMs: number,
  durationMs: number,
  volume: number,
) {
  const ac = getCtx()
  if (!ac) return
  const start = ac.currentTime + startOffsetMs / 1000
  const end = start + durationMs / 1000
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.01)
  gain.gain.setValueAtTime(volume, end - 0.04)
  gain.gain.linearRampToValueAtTime(0, end)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(start)
  osc.stop(end + 0.02)
}

export function playBeep(frequency = 880, durationMs = 200) {
  loadInitial()
  if (muted.value) return
  tone(frequency, 0, durationMs, 0.25)
}

export function playFinishCue() {
  loadInitial()
  if (muted.value) return
  tone(660, 0, 160, 0.28)
  tone(880, 180, 160, 0.28)
  tone(1175, 360, 260, 0.3)
}

export function useSoundCue() {
  loadInitial()
  return {
    muted,
    setMuted(v: boolean) {
      muted.value = v
    },
    toggleMuted() {
      muted.value = !muted.value
    },
    playBeep,
    playFinishCue,
  }
}
