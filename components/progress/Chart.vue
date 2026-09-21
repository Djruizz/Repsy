<template>
  <section class="surface p-5">
    <h2 class="text-sm font-bold uppercase tracking-wider text-white">Evolución del peso</h2>
    <div class="mt-4 flex h-40 gap-1">
      <div
        v-for="(point, idx) in data"
        :key="idx"
        class="group relative flex min-w-0 flex-1 flex-col items-center"
      >
        <div class="flex w-full flex-1 items-end">
          <div
            class="w-full rounded-t-md transition-all duration-300 hover:bg-lime/80"
            :class="idx === data.length - 1 ? 'bg-lime' : 'bg-lime/40'"
            :style="{ height: barHeight(point.weight) + '%' }"
          />
        </div>
        <span v-if="showLabel(idx)" class="mt-1.5 shrink-0 text-[9px] text-slate-500">
          {{ point.label }}
        </span>
        <span v-else class="mt-1.5 shrink-0 h-[9px]" />
        <span class="pointer-events-none absolute -top-5 rounded bg-ink-700 px-1.5 py-0.5 text-[10px] font-mono text-white opacity-0 transition group-hover:opacity-100">
          {{ point.weight }}kg
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface ChartPoint { weight: number; label: string }

const props = defineProps<{ data: ChartPoint[]; maxWeight: number }>()
function barHeight(weight: number): number {
  const max = props.maxWeight || 1
  return Math.max(8, (weight / max) * 100)
}
function showLabel(idx: number): boolean {
  if (props.data.length <= 12) return true
  return idx % 2 === 0 || idx === props.data.length - 1
}
</script>
