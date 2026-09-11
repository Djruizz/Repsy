import { ref, watch, computed } from 'vue'
import type { Day, RoutineItem, Exercise, Rest, GymData, RunSession, MuscleGroup } from '~/types'
import { localDayKey, todayKey } from '~/composables/useCalendar'

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
    routines: [],
    sessions: []
  }
}

const REQUIRED_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function sessionItemDone(s: RunSession, item: RoutineItem): boolean {
  if (s.itemStates?.[item.id] === 'done') return true
  if (item.type === 'rest') return false
  const setStates = s.setStates ?? {}
  for (let i = 0; i < item.sets; i++) {
    const st = setStates[`${item.id}:${i}`]
    if (st !== 'done' && st !== 'skipped') return false
  }
  return true
}

function sessionComplete(s: RunSession, entries: Day[]): boolean {
  const day = entries.find((d) => d.id === s.dayId)
  if (!day || !day.items.length) return false
  return day.items.every((item) => sessionItemDone(s, item))
}

function rescueSessionData(s: RunSession): RunSession {
  const startedAt = s.startedAt ?? s.date
  const durationMs = s.lastActiveAt
    ? Math.max(0, new Date(s.lastActiveAt).getTime() - new Date(startedAt).getTime())
    : s.durationMs
  // Cuenta para el día en que se entrenó, no para hoy
  return { ...s, completed: true, date: startedAt, durationMs }
}

// Sesiones incompletas que no empezaron hoy: la que tenía toda la rutina
// hecha se rescata (cuenta para su día real); el resto se descarta para no
// reanudar sesiones con progreso caduco y cronómetro inflado.
function resolveStaleSessions(
  sessions: RunSession[],
  entries: Day[],
): { sessions: RunSession[]; changed: boolean } {
  const today = todayKey()
  const out: RunSession[] = []
  let changed = false
  for (const s of sessions) {
    if (s.completed || localDayKey(s.startedAt ?? s.date) === today) {
      out.push(s)
      continue
    }
    changed = true
    if (sessionComplete(s, entries)) out.push(rescueSessionData(s))
  }
  return { sessions: out, changed }
}

function normalizeSession(s: Partial<RunSession>): RunSession {
  return {
    ...s,
    startedAt: s.startedAt ?? s.date,
    durationMs: s.durationMs ?? 0,
    setWeights: s.setWeights ?? {},
    restCycle: s.restCycle ?? {},
    restElapsed: s.restElapsed ?? {},
  } as RunSession
}

function normalizeDay(d: Partial<Day>): Day {
  return {
    ...emptyDay(''),
    ...d,
    items: Array.isArray(d.items)
      ? d.items.map((it) =>
          it.type === 'exercise'
            ? { ...(it as Exercise), score_by: (it as Exercise).score_by ?? 'reps' as const }
            : it,
        )
      : [],
  }
}

/** Rutina libre: día sin weekday (dayName: ''), corrible en cualquier momento. */
function normalizeRoutine(d: Partial<Day>): Day {
  return { ...normalizeDay(d), dayName: '' }
}

function readFromStorage(): GymData {
  if (typeof localStorage === 'undefined') return defaultData()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<GymData>
      const storedDays = Array.isArray(parsed.days) && parsed.days.length
        ? parsed.days.map((d) => ({
            ...emptyDay(''),
            ...d,
            items: Array.isArray(d.items)
              ? d.items.map((it) =>
                  it.type === 'exercise'
                    ? { ...(it as Exercise), score_by: (it as Exercise).score_by ?? 'reps' as const }
                    : it,
                )
              : [],
          }))
        : []
      const byName = new Map(storedDays.map((d) => [d.dayName, d]))
      const days = REQUIRED_DAYS.map((name) => byName.get(name) ?? emptyDay(name))
      const routines = Array.isArray(parsed.routines)
        ? parsed.routines.map(normalizeRoutine)
        : []
      const storedSessions = Array.isArray(parsed.sessions)
        ? parsed.sessions.map(normalizeSession)
        : []
      const resolved = resolveStaleSessions(storedSessions, [...days, ...routines])
      const result: GymData = {
        version: DATA_VERSION,
        days,
        routines,
        sessions: resolved.sessions,
      }
      if (resolved.changed) {
        // Se rescataron/descartaron sesiones caducas: persistir de inmediato
        writeToStorage(result)
      }
      return result
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
let touchGuard = false
let applyingRemote = false

export function useGymData() {
  if (!watchInitialized) {
    watchInitialized = true
    watch(
      data,
      (d) => {
        // Guard reentrante: el sellado de `updatedAt` dispararía este
        // watcher de nuevo (flush sync) y duplicaría la escritura.
        if (touchGuard) return
        if (applyingRemote) {
          applyingRemote = false
        } else {
          touchGuard = true
          d.updatedAt = new Date().toISOString()
          touchGuard = false
        }
        writeToStorage(d)
      },
      { deep: true, flush: 'sync' }
    )
  }

  const days = computed(() => data.value.days)
  const routines = computed(() => data.value.routines)
  const sessions = computed(() => data.value.sessions)

  /** Busca por id en los 7 días y en las rutinas libres. */
  function getDay(id: string): Day | undefined {
    return (
      data.value.days.find((d) => d.id === id) ??
      data.value.routines.find((d) => d.id === id)
    )
  }

  function updateDay(id: string, patch: Partial<Day>) {
    const d = data.value.days.find((x) => x.id === id)
    if (d) Object.assign(d, patch)
  }

  function addItem(dayId: string, item: RoutineItem) {
    const d = getDay(dayId)
    if (!d) return
    if (!item.id) (item as any).id = uid()
    d.items.push(item)
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
      score_by: 'reps',
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

  function addRoutine(): Day {
    const routine = emptyDay('')
    data.value.routines.push(routine)
    return routine
  }

  function removeRoutine(id: string) {
    data.value.routines = data.value.routines.filter((r) => r.id !== id)
    // Sus sesiones quedarían huérfanas (sin rutina no hay pesos ni nombre):
    // borrarlas también.
    data.value.sessions = data.value.sessions.filter((s) => s.dayId !== id)
  }

  function getActiveSession(dayId: string): RunSession | undefined {
    return data.value.sessions.find((s) => s.dayId === dayId && !s.completed)
  }

  function startSession(dayId: string): RunSession {
    const existing = getActiveSession(dayId)
    if (existing) return existing
    const session: RunSession = {
      id: uid(),
      dayId,
      date: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      durationMs: 0,
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

  function isSessionComplete(s: RunSession): boolean {
    return sessionComplete(s, [...data.value.days, ...data.value.routines])
  }

  /** Marca como completada una sesión olvidada, contando para su día real. */
  function rescueSession(id: string) {
    const s = data.value.sessions.find((x) => x.id === id)
    if (s && !s.completed) Object.assign(s, rescueSessionData(s))
  }

  function deleteSession(id: string) {
    data.value.sessions = data.value.sessions.filter((s) => s.id !== id)
  }

  function getWeightHistory(exerciseName: string): { date: string; weight: number; setIdx: number }[] {
    const history: { date: string; weight: number; setIdx: number }[] = []
    for (const s of data.value.sessions) {
      if (!s.completed) continue
      const day = getDay(s.dayId)
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
    for (const d of [...data.value.days, ...data.value.routines]) {
      for (const item of d.items) {
        if (item.type === 'exercise' && item.name.trim()) names.add(item.name)
      }
    }
    return [...names].sort()
  }

  function getAllExercises(): { name: string; muscle_group: MuscleGroup }[] {
    const byName = new Map<string, { name: string; muscle_group: MuscleGroup }>()
    for (const d of [...data.value.days, ...data.value.routines]) {
      for (const item of d.items) {
        if (item.type !== 'exercise') continue
        const name = item.name.trim()
        if (!name) continue
        if (!byName.has(name)) byName.set(name, { name, muscle_group: item.muscle_group })
      }
    }
    return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))
  }

  function exportData(): string {
    return JSON.stringify(data.value, null, 2)
  }

  function importData(
    json: string,
    mode: 'replace' | 'merge' = 'replace',
  ): { ok: boolean; ignoredDays: string[] } {
    try {
      const parsed = JSON.parse(json) as Partial<GymData>
      const incomingDays = Array.isArray(parsed.days) ? parsed.days.map(normalizeDay) : []
      // La app solo soporta los 7 días fijos; el resto se descarta con aviso
      const ignoredDays = [
        ...new Set(
          incomingDays
            .map((d) => d.dayName)
            .filter((name) => !!name && !REQUIRED_DAYS.includes(name)),
        ),
      ]

      if (mode === 'replace') {
        const byName = new Map(incomingDays.map((d) => [d.dayName, d]))
        data.value = {
          version: DATA_VERSION,
          days: REQUIRED_DAYS.map((name) => byName.get(name) ?? emptyDay(name)),
          routines: Array.isArray(parsed.routines)
            ? parsed.routines.map(normalizeRoutine)
            : [],
          sessions: Array.isArray(parsed.sessions)
            ? parsed.sessions.map(normalizeSession)
            : [],
        }
      } else {
        // Fusionar conservando el id del día local: las sesiones existentes
        // siguen vinculadas a su día (historial y calendario intactos).
        const existingByName = new Map(data.value.days.map((d) => [d.dayName, d]))
        const idMap = new Map<string, string>()
        for (const incoming of incomingDays) {
          const existing = existingByName.get(incoming.dayName)
          if (existing) {
            idMap.set(incoming.id, existing.id)
            existingByName.set(incoming.dayName, { ...incoming, id: existing.id })
          } else {
            existingByName.set(incoming.dayName, incoming)
          }
        }
        data.value.days = REQUIRED_DAYS.map((name) => existingByName.get(name) ?? emptyDay(name))

        // Remapear dayId de las sesiones entrantes a los ids preservados
        const incomingSessions = Array.isArray(parsed.sessions)
          ? parsed.sessions.map(normalizeSession)
          : []
        const existingIds = new Set(data.value.sessions.map((s) => s.id))
        for (const s of incomingSessions) {
          if (existingIds.has(s.id)) continue
          const mappedDayId = idMap.get(s.dayId)
          if (mappedDayId) s.dayId = mappedDayId
          data.value.sessions.push(s)
        }

        // Rutinas libres entrantes: fusionar por id
        const incomingRoutines = Array.isArray(parsed.routines)
          ? parsed.routines.map(normalizeRoutine)
          : []
        const routineIds = new Set(data.value.routines.map((r) => r.id))
        for (const r of incomingRoutines) {
          if (!routineIds.has(r.id)) data.value.routines.push(r)
        }
      }
      return { ok: true, ignoredDays }
    } catch {
      return { ok: false, ignoredDays: [] }
    }
  }

  function resetAll() {
    data.value = defaultData()
  }

  function applyRemote(remote: Partial<GymData>) {
    applyingRemote = true
    data.value = {
      version: DATA_VERSION,
      updatedAt: remote.updatedAt,
      days: Array.isArray(remote.days) ? remote.days.map(normalizeDay) : defaultData().days,
      routines: Array.isArray(remote.routines)
        ? remote.routines.map(normalizeRoutine)
        : [],
      sessions: Array.isArray(remote.sessions) ? remote.sessions.map(normalizeSession) : []
    }
  }

  return {
    data,
    days,
    routines,
    sessions,
    getDay,
    updateDay,
    addItem,
    updateItem,
    removeItem,
    moveItem,
    newExercise,
    newRest,
    addRoutine,
    removeRoutine,
    getActiveSession,
    startSession,
    updateSession,
    completeSession,
    isSessionComplete,
    rescueSession,
    deleteSession,
    getWeightHistory,
    getAllExerciseNames,
    getAllExercises,
    exportData,
    importData,
    resetAll,
    applyRemote
  }
}
