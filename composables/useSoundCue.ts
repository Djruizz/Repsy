import { ref, watch } from 'vue'

const STORAGE_KEY = 'gymapp:soundMuted'

const muted = ref<boolean>(false)
let initialized = false

let ctx: AudioContext | null = null
let chimeUrl: string | null = null
let chimeAudio: HTMLAudioElement | null = null

/** Empaqueta muestras PCM 16-bit mono en una Blob URL WAV válida en memoria. */
export function buildWavBlobUrl(samples: Int16Array, sampleRate = 8000): string | null {
  if (typeof Blob === 'undefined' || typeof URL === 'undefined') return null
  const dataSize = samples.length * 2
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  const writeAscii = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  writeAscii(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeAscii(8, 'WAVE')
  writeAscii(12, 'fmt ')
  view.setUint32(16, 16, true) // subchunk1 size (PCM)
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeAscii(36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let i = 0; i < samples.length; i++, offset += 2) {
    view.setInt16(offset, samples[i], true)
  }

  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
}

function getChimeAudio(): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') return null
  if (chimeAudio) return chimeAudio

  const sampleRate = 22050
  const totalSec = 0.65
  const totalSamples = Math.floor(sampleRate * totalSec)
  const samples = new Int16Array(totalSamples)
  const notes = [
    { freq: 660, startMs: 0, durMs: 160, vol: 0.28 },
    { freq: 880, startMs: 180, durMs: 160, vol: 0.28 },
    { freq: 1175, startMs: 360, durMs: 260, vol: 0.3 },
  ]

  for (const n of notes) {
    const startIdx = Math.floor((n.startMs / 1000) * sampleRate)
    const len = Math.floor((n.durMs / 1000) * sampleRate)
    const fadeIn = Math.floor(0.01 * sampleRate)
    const fadeOut = Math.floor(0.04 * sampleRate)
    for (let i = 0; i < len && startIdx + i < totalSamples; i++) {
      let env = 1
      if (i < fadeIn) env = i / fadeIn
      else if (i > len - fadeOut) env = Math.max(0, (len - i) / fadeOut)
      const t = i / sampleRate
      const val = Math.sin(2 * Math.PI * n.freq * t) * n.vol * env
      const mixed = samples[startIdx + i] + Math.round(val * 32767)
      samples[startIdx + i] = Math.max(-32767, Math.min(32767, mixed))
    }
  }

  chimeUrl = buildWavBlobUrl(samples, sampleRate)
  if (!chimeUrl) return null
  chimeAudio = new Audio(chimeUrl)
  chimeAudio.setAttribute('playsinline', '')
  chimeAudio.preload = 'auto'
  return chimeAudio
}

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
    void ctx.resume().catch(() => {})
  }
  return ctx
}

/** Prepara el AudioContext y el buffer WAV tras un gesto explícito del usuario. */
export function unlockAudio() {
  getCtx()
  getChimeAudio()
}

function tone(
  ac: AudioContext,
  frequency: number,
  startOffsetMs: number,
  durationMs: number,
  volume: number,
) {
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

function playChimeFallback() {
  const audio = getChimeAudio()
  if (!audio) return
  try {
    audio.currentTime = 0
    void audio.play().catch(() => {})
  } catch {
    /* ignore autoplay block */
  }
}

export function playFinishCue() {
  loadInitial()
  if (muted.value) return

  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([180, 80, 180, 80, 260])
    } catch {
      /* ignore */
    }
  }

  const ac = getCtx()
  if (ac && ac.state === 'running') {
    tone(ac, 660, 0, 160, 0.28)
    tone(ac, 880, 180, 160, 0.28)
    tone(ac, 1175, 360, 260, 0.3)
    return
  }

  // Respaldo HTMLAudio cuando AudioContext sigue suspendido en segundo plano (iOS)
  if (ac) {
    void ac
      .resume()
      .then(() => {
        if (ac.state === 'running') {
          tone(ac, 660, 0, 160, 0.28)
          tone(ac, 880, 180, 160, 0.28)
          tone(ac, 1175, 360, 260, 0.3)
        } else {
          playChimeFallback()
        }
      })
      .catch(() => playChimeFallback())
  } else {
    playChimeFallback()
  }
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
    unlockAudio,
    playFinishCue,
  }
}
