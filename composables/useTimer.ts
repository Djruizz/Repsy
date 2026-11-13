import { ref, computed, onUnmounted } from 'vue'

/**
 * Coordina rAF (fluidez visual en primer plano), un setInterval de respaldo
 * (cuando rAF se congela en segundo plano) y eventos de visibilidad para
 * sincronizar inmediatamente con el reloj real al desbloquear el dispositivo.
 */
function createTicker(onTick: () => void, intervalMs: number) {
  let raf = 0
  let interval: ReturnType<typeof setInterval> | null = null
  let active = false

  function frame() {
    if (!active) return
    onTick()
    if (active && typeof requestAnimationFrame !== 'undefined') {
      raf = requestAnimationFrame(frame)
    }
  }

  function onWake() {
    if (active) onTick()
  }

  function start() {
    stop()
    active = true
    if (typeof requestAnimationFrame !== 'undefined') {
      raf = requestAnimationFrame(frame)
    }
    interval = setInterval(onTick, intervalMs)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onWake)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('pageshow', onWake)
      window.addEventListener('focus', onWake)
    }
  }

  function stop() {
    active = false
    if (raf && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(raf)
    }
    raf = 0
    if (interval) {
      clearInterval(interval)
      interval = null
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onWake)
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('pageshow', onWake)
      window.removeEventListener('focus', onWake)
    }
  }

  return { start, stop }
}

export function useStopwatch() {
  const elapsedMs = ref(0)
  const running = ref(false)
  const paused = ref(false)

  let startTs = 0
  let base = 0

  function tick() {
    if (!running.value) return
    elapsedMs.value = base + Math.max(0, Date.now() - startTs)
  }

  const ticker = createTicker(tick, 500)

  function start() {
    if (running.value) return
    running.value = true
    paused.value = false
    base = 0
    elapsedMs.value = 0
    startTs = Date.now()
    ticker.start()
  }

  function pause() {
    if (!running.value) return
    tick()
    base = elapsedMs.value
    running.value = false
    paused.value = true
    ticker.stop()
  }

  function resume() {
    if (running.value) return
    running.value = true
    paused.value = false
    startTs = Date.now()
    ticker.start()
  }

  function stop(): number {
    tick()
    const final = elapsedMs.value
    running.value = false
    paused.value = false
    ticker.stop()
    return final
  }

  function reset() {
    stop()
    base = 0
    elapsedMs.value = 0
  }

  function seed(ms: number) {
    stop()
    base = ms
    elapsedMs.value = ms
    paused.value = ms > 0
  }

  onUnmounted(() => ticker.stop())

  const seconds = computed(() => Math.floor(elapsedMs.value / 1000))
  const tenths = computed(() => Math.floor((elapsedMs.value % 1000) / 100))

  return { elapsedMs, seconds, tenths, running, paused, start, pause, resume, stop, reset, seed }
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (s === 0) return `${m}min`
  return `${m}m ${s}s`
}

export function useCountdown() {
  const targetMs = ref(0)
  const remainingMs = ref(0)
  const endAt = ref<number | null>(null)
  const running = ref(false)
  const paused = ref(false)
  const finished = ref(false)

  function tick() {
    if (!running.value || endAt.value == null) return
    const left = Math.max(0, endAt.value - Date.now())
    remainingMs.value = left
    if (left <= 0) {
      running.value = false
      paused.value = false
      finished.value = true
      endAt.value = null
      ticker.stop()
    }
  }

  const ticker = createTicker(tick, 250)

  function start(seconds: number) {
    ticker.stop()
    const ms = Math.max(0, seconds * 1000)
    targetMs.value = ms
    remainingMs.value = ms
    if (ms <= 0) {
      running.value = false
      paused.value = false
      finished.value = true
      endAt.value = null
      return
    }
    finished.value = false
    running.value = true
    paused.value = false
    endAt.value = Date.now() + ms
    ticker.start()
  }

  function pause() {
    if (!running.value) return
    tick()
    if (!running.value) return
    running.value = false
    paused.value = true
    endAt.value = null
    ticker.stop()
  }

  function resume() {
    if (running.value || finished.value) return
    if (remainingMs.value <= 0) {
      finished.value = true
      paused.value = false
      return
    }
    running.value = true
    paused.value = false
    endAt.value = Date.now() + remainingMs.value
    ticker.start()
  }

  function stop() {
    running.value = false
    paused.value = false
    finished.value = false
    endAt.value = null
    ticker.stop()
    remainingMs.value = 0
  }

  function skip() {
    stop()
    finished.value = true
  }

  function add(seconds: number) {
    if (finished.value) return
    const delta = seconds * 1000
    remainingMs.value = Math.max(0, remainingMs.value + delta)
    targetMs.value = Math.max(0, targetMs.value + delta)
    if (running.value && endAt.value != null) {
      endAt.value += delta
      tick()
    }
  }

  function seedMs(remaining: number, total: number) {
    ticker.stop()
    running.value = false
    paused.value = true
    finished.value = false
    endAt.value = null
    targetMs.value = Math.max(0, total)
    remainingMs.value = Math.max(0, remaining)
  }

  function seed(remainingSeconds: number, totalSeconds: number) {
    seedMs(remainingSeconds * 1000, totalSeconds * 1000)
  }

  /** Restaura el temporizador desde un timestamp epoch (ms) guardado en sesión. */
  function restoreFromWallClock(endAtMs: number, totalMs: number) {
    ticker.stop()
    targetMs.value = Math.max(0, totalMs)
    const left = Math.max(0, endAtMs - Date.now())
    remainingMs.value = left
    if (left <= 0) {
      running.value = false
      paused.value = false
      finished.value = true
      endAt.value = null
      return
    }
    running.value = true
    paused.value = false
    finished.value = false
    endAt.value = endAtMs
    ticker.start()
  }

  onUnmounted(() => ticker.stop())

  const seconds = computed(() => Math.ceil(remainingMs.value / 1000))
  const tenths = computed(() => Math.floor((remainingMs.value % 1000) / 100))
  const progress = computed(() => {
    if (targetMs.value <= 0) return 0
    return Math.min(1, Math.max(0, 1 - remainingMs.value / targetMs.value))
  })

  return {
    remainingMs,
    targetMs,
    endAt,
    seconds,
    tenths,
    progress,
    running,
    paused,
    finished,
    start,
    pause,
    resume,
    stop,
    skip,
    add,
    seed,
    seedMs,
    restoreFromWallClock,
    sync: tick,
  }
}
