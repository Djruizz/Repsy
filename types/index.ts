export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'abs'
  | 'calves'
  | 'forearms'
  | 'cardio'
  | 'full_body'

export interface MuscleMeta {
  id: MuscleGroup
  label: string
  color: string
}

export const MUSCLE_GROUPS: MuscleMeta[] = [
  { id: 'chest', label: 'Pecho', color: '#ff7a45' },
  { id: 'back', label: 'Espalda', color: '#5b9dff' },
  { id: 'shoulders', label: 'Hombros', color: '#c6f135' },
  { id: 'biceps', label: 'Bíceps', color: '#f0a040' },
  { id: 'triceps', label: 'Tríceps', color: '#a78bfa' },
  { id: 'legs', label: 'Piernas', color: '#2dd4bf' },
  { id: 'glutes', label: 'Glúteos', color: '#f472b6' },
  { id: 'abs', label: 'Abdominales', color: '#facc15' },
  { id: 'calves', label: 'Pantorrillas', color: '#34d399' },
  { id: 'forearms', label: 'Antebrazos', color: '#fb923c' },
  { id: 'cardio', label: 'Cardio', color: '#f87171' },
  { id: 'full_body', label: 'Cuerpo completo', color: '#94a3b8' }
]

export function muscleMeta(id: MuscleGroup): MuscleMeta {
  return MUSCLE_GROUPS.find((m) => m.id === id) ?? MUSCLE_GROUPS[MUSCLE_GROUPS.length - 1]
}

export type ItemType = 'exercise' | 'rest'

export interface BaseItem {
  id: string
  type: ItemType
}

export interface Exercise extends BaseItem {
  type: 'exercise'
  name: string
  muscle_group: MuscleGroup
  rpe: number
  sets: number
  reps_range: string
  time: number
  rest_between_sets: number
}

export interface Rest extends BaseItem {
  type: 'rest'
  label: string
  duration: number
}

export type RoutineItem = Exercise | Rest

export interface Day {
  id: string
  dayName: string
  routineName: string
  description: string
  warmup: string
  items: RoutineItem[]
  enabled: boolean
}

export type SetState = 'pending' | 'done' | 'skipped'
export type ItemRunState = 'pending' | 'active' | 'done'

export interface RunSession {
  id: string
  dayId: string
  date: string
  startedAt: string
  durationMs: number
  completed: boolean
  itemStates: Record<string, ItemRunState>
  setStates: Record<string, SetState>
  setWeights: Record<string, number>
  restElapsed: Record<string, number>
  restCycle: Record<string, number>
}

export interface GymData {
  version: number
  days: Day[]
  sessions: RunSession[]
}

export const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
