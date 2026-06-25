import { ref, watch, computed } from 'vue'
import type { Day, RoutineItem, Exercise, Rest, GymData, RunSession } from '~/types'

const STORAGE_KEY = 'gymapp:data'
const DATA_VERSION = 1

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function emptyDay(dayName: string): Day {
  return {
    id: uid(),
    dayName,
    routineName: '',
    description: '',
    warmup: '',
    items: [],
    enabled: true
  }
}

function defaultData(): GymData {
  return {
    version: DATA_VERSION,
    days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(emptyDay),
    sessions: []
  }
}

const REQUIRED_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function readFromStorage(): GymData {
  if (typeof localStorage === 'undefined') return defaultData()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GymData>
      const storedDays = Array.isArray(parsed.days) && parsed.days.length
        ? parsed.days.map((d) => ({ ...emptyDay(''), ...d }))
        : []
      const byName = new Map(storedDays.map((d) => [d.dayName, d]))
      const days = REQUIRED_DAYS.map((name) => byName.get(name) ?? emptyDay(name))
      return {
        version: DATA_VERSION,
        days,
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : []
      }
    }
  } catch {
    // fall through to default
  }
  const fresh = defaultData()
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
  }
  return fresh
}

function writeToStorage(d: GymData) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d))
  }
}

// ── Shared singleton state (SPA mode: localStorage always available) ──────
const data = ref<GymData>(readFromStorage())
let watchInitialized = false

export function useGymData() {
  if (!watchInitialized) {
    watchInitialized = true
    watch(
      data,
      (d) => writeToStorage(d),
      { deep: true, flush: 'sync' }
    )
  }

  const days = computed(() => data.value.days)
  const sessions = computed(() => data.value.sessions)

  function getDay(id: string): Day | undefined {
    return data.value.days.find((d) => d.id === id)
  }

  function updateDay(id: string, patch: Partial<Day>) {
    const d = data.value.days.find((x) => x.id === id)
    if (d) Object.assign(d, patch)
  }

  function addItem(dayId: string, item: Omit<RoutineItem, 'id'>) {
    const d = getDay(dayId)
    if (!d) return
    d.items.push({ id: uid(), ...item } as RoutineItem)
  }

  function updateItem(dayId: string, itemId: string, patch: Partial<RoutineItem>) {
    const d = getDay(dayId)
    const it = d?.items.find((i) => i.id === itemId)
    if (it) Object.assign(it, patch)
  }

  function removeItem(dayId: string, itemId: string) {
    const d = getDay(dayId)
    if (!d) return
    d.items = d.items.filter((i) => i.id !== itemId)
  }

  function moveItem(dayId: string, itemId: string, dir: -1 | 1) {
    const d = getDay(dayId)
    if (!d) return
    const idx = d.items.findIndex((i) => i.id === itemId)
    const target = idx + dir
    if (idx < 0 || target < 0 || target >= d.items.length) return
    const [moved] = d.items.splice(idx, 1)
    d.items.splice(target, 0, moved)
  }

  function newExercise(partial: Partial<Exercise> = {}): Exercise {
    return {
      id: uid(),
      type: 'exercise',
      name: '',
      muscle_group: 'chest',
      rpe: 7,
      sets: 3,
      reps_range: '8-12',
      time: 0,
      rest_between_sets: 90,
      ...partial
    }
  }

  function newRest(partial: Partial<Rest> = {}): Rest {
    return {
      id: uid(),
      type: 'rest',
      label: 'Descanso',
      duration: 90,
      ...partial
    }
  }

  function getActiveSession(dayId: string): RunSession | undefined {
    return data.value.sessions.find((s) => s.dayId === dayId && !s.completed)
  }

  function getSessionForDate(date: string): RunSession | undefined {
    return data.value.sessions.find((s) => s.date.startsWith(date) && s.completed)
  }

  function startSession(dayId: string): RunSession {
    const existing = getActiveSession(dayId)
    if (existing) return existing
    const session: RunSession = {
      id: uid(),
      dayId,
      date: new Date().toISOString(),
      completed: false,
      itemStates: {},
      setStates: {},
      setWeights: {},
      restElapsed: {},
      restCycle: {}
    }
    data.value.sessions.push(session)
    return session
  }

  function updateSession(id: string, patch: Partial<RunSession>) {
    const s = data.value.sessions.find((x) => x.id === id)
    if (s) Object.assign(s, patch)
  }

  function completeSession(id: string) {
    const s = data.value.sessions.find((x) => x.id === id)
    if (s) {
      s.completed = true
      s.date = new Date().toISOString()
    }
  }

  function deleteSession(id: string) {
    data.value.sessions = data.value.sessions.filter((s) => s.id !== id)
  }

  function getWeightHistory(exerciseName: string): { date: string; weight: number; setIdx: number }[] {
    const history: { date: string; weight: number; setIdx: number }[] = []
    for (const s of data.value.sessions) {
      if (!s.completed) continue
      const day = data.value.days.find((d) => d.id === s.dayId)
      if (!day) continue
      for (const item of day.items) {
        if (item.type !== 'exercise' || item.name !== exerciseName) continue
        for (let i = 0; i < item.sets; i++) {
          const w = s.setWeights[`${item.id}:${i}`]
          if (w != null) history.push({ date: s.date, weight: w, setIdx: i })
        }
      }
    }
    return history.sort((a, b) => a.date.localeCompare(b.date))
  }

  function getAllExerciseNames(): string[] {
    const names = new Set<string>()
    for (const d of data.value.days) {
      for (const item of d.items) {
        if (item.type === 'exercise' && item.name.trim()) names.add(item.name)
      }
    }
    return [...names].sort()
  }

  function exportData(): string {
    return JSON.stringify(data.value, null, 2)
  }

  function importData(json: string, mode: 'replace' | 'merge' = 'replace'): boolean {
    try {
      const parsed = JSON.parse(json) as Partial<GymData>
      if (mode === 'replace') {
        data.value = {
          version: DATA_VERSION,
          days: Array.isArray(parsed.days) ? parsed.days.map((d) => ({ ...emptyDay(''), ...d })) : defaultData().days,
        sessions: Array.isArray(parsed.sessions)
          ? parsed.sessions.map((s) => ({ ...s, setWeights: s.setWeights ?? {} }))
          : []
        }
      } else {
        const incomingDays = Array.isArray(parsed.days) ? parsed.days : []
        data.value.days = [...data.value.days, ...incomingDays.map((d) => ({ ...emptyDay(''), ...d }))]
      }
      return true
    } catch {
      return false
    }
  }

  function resetAll() {
    data.value = defaultData()
  }

  return {
    data,
    days,
    sessions,
    getDay,
    updateDay,
    addItem,
    updateItem,
    removeItem,
    moveItem,
    newExercise,
    newRest,
    getActiveSession,
    getSessionForDate,
    startSession,
    updateSession,
    completeSession,
    deleteSession,
    getWeightHistory,
    getAllExerciseNames,
    exportData,
    importData,
    resetAll
  }
}
