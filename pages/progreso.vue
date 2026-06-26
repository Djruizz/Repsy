<template>
  <div class="space-y-6">
    <section>
      <h1 class="text-2xl font-bold tracking-tight text-white">Progreso</h1>
      <p class="mt-1 text-sm text-slate-400">Historial de pesos por ejercicio</p>
    </section>

    <!-- Exercise selector -->
    <ProgressExerciseSelector
      v-if="exerciseNames.length"
      :names="exerciseNames"
      v-model="selected"
    />
    <UiEmptyState
      v-else
      title="Aún no tienes ejercicios registrados."
      subtitle="Completa una rutina registrando pesos para ver tu progreso."
    />

    <!-- Stats -->
    <ProgressStats
      v-if="selected && history.length"
      :max-weight="maxWeight"
      :last-weight="lastWeight"
      :progress-delta="progressDelta"
    />

    <!-- Chart -->
    <ProgressChart
      v-if="selected && history.length"
      :data="chartData"
      :max-weight="maxWeight"
    />

    <!-- History list -->
    <ProgressHistory
      v-if="selected && history.length"
      :entries="groupedHistory"
    />

    <UiEmptyState
      v-if="selected && !history.length"
      :title='`Sin registros de peso para "${selected}".`'
      subtitle="Registra pesos al completar series en el runner."
    />
  </div>
</template>

<script setup lang="ts">
import { localDayKey } from '~/composables/useCalendar'
const { getAllExerciseNames, getWeightHistory } = useGymData()

const exerciseNames = computed(() => getAllExerciseNames())
const selected = ref('')

watch(exerciseNames, (names) => {
  if (names.length && !names.includes(selected.value)) {
    selected.value = names[0]
  }
}, { immediate: true })

const history = computed(() => selected.value ? getWeightHistory(selected.value) : [])

const maxWeight = computed(() => Math.max(...history.value.map(h => h.weight), 0))
const lastWeight = computed(() => {
  const sorted = [...history.value].sort((a, b) => b.date.localeCompare(a.date))
  return sorted[0]?.weight ?? 0
})
const firstWeight = computed(() => {
  const sorted = [...history.value].sort((a, b) => a.date.localeCompare(b.date))
  return sorted[0]?.weight ?? 0
})
const progressDelta = computed(() => lastWeight.value - firstWeight.value)

interface ChartPoint { weight: number; label: string }
const chartData = computed<ChartPoint[]>(() => {
  const byDate = new Map<string, number>()
  for (const h of history.value) {
    const key = localDayKey(h.date)
    const existing = byDate.get(key)
    if (existing == null || h.weight > existing) byDate.set(key, h.weight)
  }
  const entries = Array.from(byDate.entries())
  entries.sort((a, b) => a[0].localeCompare(b[0]))
  const points: ChartPoint[] = []
  for (const [date, weight] of entries) {
    const d = new Date(date)
    points.push({
      weight,
      label: `${d.getDate()}/${d.getMonth() + 1}`
    })
  }
  return points.slice(-20)
})

interface GroupedEntry { date: string; sets: { setIdx: number; weight: number }[] }
const groupedHistory = computed<GroupedEntry[]>(() => {
  const byDate = new Map<string, { setIdx: number; weight: number }[]>()
  for (const h of history.value) {
    const key = localDayKey(h.date)
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push({ setIdx: h.setIdx, weight: h.weight })
  }
  const entries: GroupedEntry[] = []
  for (const [date, sets] of byDate) {
    entries.push({ date, sets: sets.sort((a, b) => a.setIdx - b.setIdx) })
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date))
})
</script>
