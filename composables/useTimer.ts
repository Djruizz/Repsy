import { ref, computed, onUnmounted, watch } from 'vue'

export function useStopwatch() {
  const elapsedMs = ref(0)
  const running = ref(false)
  const paused = ref(false)

  let startTs = 0
  let base = 0
  let raf = 0

  function loop() {
    elapsedMs.value = base + (performance.now() - startTs)
    if (running.value) raf = requestAnimationFrame(loop)
  }

  function start() {
    if (running.value) return
    running.value = true
    paused.value = false
    base = 0
    elapsedMs.value = 0
    startTs = performance.now()
    raf = requestAnimationFrame(loop)
  }

  function pause() {
    if (!running.value) return
    base = elapsedMs.value
    running.value = false
    paused.value = true
    cancelAnimationFrame(raf)
  }

  function resume() {
    if (running.value) return
    running.value = true
    paused.value = false
    startTs = performance.now()
    raf = requestAnimationFrame(loop)
  }

  function stop(): number {
    const final = elapsedMs.value
    running.value = false
    paused.value = false
    cancelAnimationFrame(raf)
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

  onUnmounted(() => cancelAnimationFrame(raf))

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
  const running = ref(false)
  const paused = ref(false)
  const finished = ref(false)

  let endTs = 0
  let raf = 0

  function loop() {
    const now = performance.now()
    const left = Math.max(0, endTs - now)
    remainingMs.value = left
    if (left <= 0) {
      running.value = false
      paused.value = false
      finished.value = true
      cancelAnimationFrame(raf)
      return
    }
    if (running.value) raf = requestAnimationFrame(loop)
  }

  function start(seconds: number) {
    cancelAnimationFrame(raf)
    finished.value = false
    targetMs.value = seconds * 1000
    remainingMs.value = seconds * 1000
    running.value = true
    paused.value = false
    endTs = performance.now() + seconds * 1000
    raf = requestAnimationFrame(loop)
  }

  function pause() {
    if (!running.value) return
    running.value = false
    paused.value = true
    cancelAnimationFrame(raf)
  }

  function resume() {
    if (running.value || finished.value) return
    running.value = true
    paused.value = false
    endTs = performance.now() + remainingMs.value
    raf = requestAnimationFrame(loop)
  }

  function stop() {
    running.value = false
    paused.value = false
    finished.value = false
    cancelAnimationFrame(raf)
    remainingMs.value = 0
  }

  function skip() {
    stop()
    finished.value = true
  }

  onUnmounted(() => cancelAnimationFrame(raf))

  const seconds = computed(() => Math.ceil(remainingMs.value / 1000))
  const tenths = computed(() => Math.floor((remainingMs.value % 1000) / 100))
  const progress = computed(() => {
    if (targetMs.value <= 0) return 0
    return Math.min(1, 1 - remainingMs.value / targetMs.value)
  })

  return { remainingMs, seconds, tenths, progress, running, paused, finished, start, pause, resume, stop, skip }
}
