<template>
  <div class="space-y-6">
    <section>
      <h1 class="text-2xl font-bold tracking-tight text-white">Progreso</h1>
      <p class="mt-1 text-sm text-slate-400">Historial de pesos por ejercicio</p>
    </section>

    <!-- Exercise selector -->
    <div v-if="exerciseNames.length" class="flex gap-1.5 overflow-x-auto no-scrollbar">
      <button
        v-for="name in exerciseNames" :key="name"
        class="shrink-0 rounded-xl border px-3 py-2 text-xs font-medium transition"
        :class="selected === name ? 'border-lime/40 bg-lime/10 text-lime' : 'border-white/5 bg-ink-850 text-slate-400 hover:text-slate-200'"
        @click="selected = name"
      >
        {{ name }}
      </button>
    </div>

    <div v-else class="surface flex flex-col items-center gap-2 px-4 py-10 text-center">
      <AppIcon name="dumbbell" class="h-8 w-8 text-slate-600" />
      <p class="text-sm text-slate-400">Aún no tienes ejercicios registrados.</p>
      <p class="text-xs text-slate-500">Completa una rutina registrando pesos para ver tu progreso.</p>
    </div>

    <!-- Stats -->
    <section v-if="selected && history.length" class="grid grid-cols-3 gap-3">
      <div class="surface p-4">
        <p class="text-2xl font-bold text-lime">{{ maxWeight }} <span class="text-sm text-slate-400">kg</span></p>
        <p class="mt-1 text-xs text-slate-400">Peso máximo</p>
      </div>
      <div class="surface p-4">
        <p class="text-2xl font-bold text-white">{{ lastWeight }} <span class="text-sm text-slate-400">kg</span></p>
        <p class="mt-1 text-xs text-slate-400">Último registro</p>
      </div>
      <div class="surface p-4">
        <p class="text-2xl font-bold" :class="progressDelta > 0 ? 'text-lime' : progressDelta < 0 ? 'text-ember' : 'text-white'">
          {{ progressDelta > 0 ? '+' : '' }}{{ progressDelta }} <span class="text-sm text-slate-400">kg</span>
        </p>
        <p class="mt-1 text-xs text-slate-400">Cambio total</p>
      </div>
    </section>

    <!-- Chart -->
    <section v-if="selected && history.length" class="surface p-5">
      <h2 class="text-sm font-bold uppercase tracking-wider text-white">Evolución del peso</h2>
      <div class="mt-4 flex h-40 items-end gap-1">
        <div
          v-for="(point, idx) in chartData" :key="idx"
          class="group relative flex flex-1 flex-col items-center justify-end"
        >
          <div
            class="w-full rounded-t-md transition-all duration-300 hover:bg-lime/80"
            :class="idx === chartData.length - 1 ? 'bg-lime' : 'bg-lime/40'"
            :style="{ height: barHeight(point.weight) + '%' }"
          />
          <span class="mt-1.5 text-[9px] text-slate-500">{{ point.label }}</span>
          <span class="absolute -top-5 rounded bg-ink-700 px-1.5 py-0.5 text-[10px] font-mono text-white opacity-0 transition group-hover:opacity-100">
            {{ point.weight }}kg
          </span>
        </div>
      </div>
    </section>

    <!-- History list -->
    <section v-if="selected && history.length">
      <h2 class="label mb-2">Historial detallado</h2>
      <div class="space-y-1.5">
        <div
          v-for="(entry, idx) in groupedHistory" :key="idx"
          class="surface flex items-center gap-3 p-3.5"
        >
          <div class="flex flex-col items-center">
            <span class="text-xs font-semibold text-slate-400">{{ formatDateShort(entry.date) }}</span>
            <span class="text-[10px] text-slate-600">{{ formatTimeShort(entry.date) }}</span>
          </div>
          <div class="h-8 w-px bg-white/5" />
          <div class="flex flex-1 flex-wrap gap-1.5">
            <span
              v-for="s in entry.sets" :key="s.setIdx"
              class="chip bg-white/5 text-slate-300"
            >
              S{{ s.setIdx + 1 }}: <b class="font-mono text-slate-200">{{ s.weight }}</b>kg
            </span>
          </div>
        </div>
      </div>
    </section>

    <div v-if="selected && !history.length" class="surface flex flex-col items-center gap-2 px-4 py-10 text-center">
      <AppIcon name="dumbbell" class="h-8 w-8 text-slate-600" />
      <p class="text-sm text-slate-400">Sin registros de peso para "{{ selected }}".</p>
      <p class="text-xs text-slate-500">Registra pesos al completar series en el runner.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
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
    const key = h.date.slice(0, 10)
    const existing = byDate.get(key)
    if (existing == null || h.weight > existing) byDate.set(key, h.weight)
  }
  const points: ChartPoint[] = []
  for (const [date, weight] of byDate) {
    const d = new Date(date)
    points.push({
      weight,
      label: `${d.getDate()}/${d.getMonth() + 1}`
    })
  }
  return points.slice(-20)
})

function barHeight(weight: number): number {
  const max = maxWeight.value || 1
  return Math.max(8, (weight / max) * 100)
}

interface GroupedEntry { date: string; sets: { setIdx: number; weight: number }[] }
const groupedHistory = computed<GroupedEntry[]>(() => {
  const byDate = new Map<string, { setIdx: number; weight: number }[]>()
  for (const h of history.value) {
    const key = h.date.slice(0, 10)
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push({ setIdx: h.setIdx, weight: h.weight })
  }
  const entries: GroupedEntry[] = []
  for (const [date, sets] of byDate) {
    entries.push({ date, sets: sets.sort((a, b) => a.setIdx - b.setIdx) })
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date))
})

function formatDateShort(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

function formatTimeShort(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}
</script>
