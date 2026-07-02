import type { MuscleGroup } from '~/types'
import catalogRaw from '~/assets/exercises_es.json'

interface RawExercise {
  name: string
  force: string | null
  level: string
  mechanic: string | null
  equipment: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
  instructions: string[]
  category: string
  images: string[]
  id: string
}

export interface CatalogExercise {
  id: string
  name: string
  muscleGroup: MuscleGroup
  equipment: string
  category: string
  instructions: string[]
  images: string[]
}

const muscleMap: Record<string, MuscleGroup> = {
  abdominales: 'abs',
  abductores: 'abductors',
  aductores: 'adductors',
  antebrazos: 'forearms',
  bíceps: 'biceps',
  cuádriceps: 'quadriceps',
  cuello: 'neck',
  dorsales: 'lats',
  'espalda baja': 'lower_back',
  'espalda media': 'mid_back',
  glúteos: 'glutes',
  hombros: 'shoulders',
  isquiotibiales: 'hamstrings',
  pantorrillas: 'calves',
  pecho: 'chest',
  tríceps: 'triceps',
  trapecios: 'traps',
}

function mapMuscle(raw: string): MuscleGroup | null {
  const normalized = raw.normalize('NFC').toLowerCase()
  return muscleMap[normalized] ?? null
}

function normalize(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

const catalog: CatalogExercise[] = (catalogRaw as RawExercise[]).map((raw) => ({
  id: raw.id,
  name: raw.name,
  muscleGroup: (raw.primaryMuscles.map(mapMuscle).find(Boolean) as MuscleGroup) ?? 'full_body',
  equipment: raw.equipment,
  category: raw.category,
  instructions: raw.instructions,
  images: raw.images,
}))

export function useExerciseCatalog() {
  function search(
    query: string,
    filters?: { muscleGroup?: MuscleGroup; equipment?: string }
  ): CatalogExercise[] {
    const q = normalize(query.trim())
    if (!q && !filters?.muscleGroup && !filters?.equipment) return catalog.slice(0, 50)

    let results = catalog

    if (q) {
      results = results.filter((e) => normalize(e.name).includes(q))
    }
    if (filters?.muscleGroup) {
      results = results.filter((e) => e.muscleGroup === filters.muscleGroup)
    }
    if (filters?.equipment) {
      const eq = normalize(filters.equipment)
      results = results.filter((e) => normalize(e.equipment).includes(eq))
    }

    return results.slice(0, 50)
  }

  function findByExactName(name: string): CatalogExercise | undefined {
    const trimmed = name.trim()
    return catalog.find((e) => e.name === trimmed)
  }

  return { exercises: catalog, search, findByExactName }
}
