<template>
  <div class="space-y-6">
    <section>
      <h1 class="text-2xl font-bold tracking-tight text-white">Progreso</h1>
      <p class="mt-1 text-sm text-slate-400">
        Historial de pesos por ejercicio
      </p>
    </section>

    <!-- Exercise selector -->
    <ProgressExerciseSelector
      v-if="exercises.length"
      :exercises="exercises"
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
      :title="`Sin registros de peso para &quot;${selected}&quot;.`"
      subtitle="Registra pesos al completar series en el runner."
    />

    <UiEmptyState
      v-if="!selected && exercises.length"
      title="Selecciona un ejercicio para ver su progreso."
      subtitle="Puedes buscarlo por nombre o filtrar por grupo muscular."
    />
  </div>
</template>

<script setup lang="ts">
import { localDayKey, parseDateKey } from "~/composables/useCalendar";
const { getAllExercises, getWeightHistory } = useGymData();

const exercises = computed(() => getAllExercises());
const selected = ref("");

const history = computed(() =>
  selected.value ? getWeightHistory(selected.value) : [],
);

// Peso máximo por día local (mismo criterio que el chart)
const byDateMax = computed(() => {
  const m = new Map<string, number>();
  for (const h of history.value) {
    const k = localDayKey(h.date);
    const cur = m.get(k);
    if (cur == null || h.weight > cur) m.set(k, h.weight);
  }
  return m;
});
const sortedDates = computed(() =>
  [...byDateMax.value.keys()].sort((a, b) => a.localeCompare(b)),
);

const maxWeight = computed(() =>
  Math.max(...history.value.map((h) => h.weight), 0),
);
const lastWeight = computed(() => {
  const dates = sortedDates.value;
  return dates.length ? (byDateMax.value.get(dates[dates.length - 1]) ?? 0) : 0;
});
const firstWeight = computed(() => {
  const dates = sortedDates.value;
  return dates.length ? (byDateMax.value.get(dates[0]) ?? 0) : 0;
});
const progressDelta = computed(() => lastWeight.value - firstWeight.value);

interface ChartPoint {
  weight: number;
  label: string;
}
const chartData = computed<ChartPoint[]>(() =>
  sortedDates.value.slice(-20).map((date) => {
    const d = parseDateKey(date);
    return {
      weight: byDateMax.value.get(date) ?? 0,
      label: `${d.getDate()}/${d.getMonth() + 1}`,
    };
  }),
);

interface GroupedEntry {
  date: string;
  sets: { setIdx: number; weight: number }[];
}
const groupedHistory = computed<GroupedEntry[]>(() => {
  const byDate = new Map<string, { setIdx: number; weight: number }[]>();
  for (const h of history.value) {
    const key = localDayKey(h.date);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push({ setIdx: h.setIdx, weight: h.weight });
  }
  const entries: GroupedEntry[] = [];
  for (const [date, sets] of byDate) {
    entries.push({ date, sets: sets.sort((a, b) => a.setIdx - b.setIdx) });
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date));
});
</script>
