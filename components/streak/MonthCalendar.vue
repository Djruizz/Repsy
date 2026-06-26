<template>
  <section class="surface p-5">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="btn-ghost px-2.5 py-2" @click="$emit('update:monthOffset', monthOffset - 1)">
          <AppIcon name="arrow-left" class="h-4 w-4" />
        </button>
        <h2 class="text-sm font-bold capitalize tracking-tight text-white">{{ monthTitle }}</h2>
        <button class="btn-ghost px-2.5 py-2" @click="$emit('update:monthOffset', monthOffset + 1)">
          <AppIcon name="arrow-right" class="h-4 w-4" />
        </button>
      </div>
      <button
        v-if="monthOffset !== 0"
        class="text-xs font-medium text-slate-400 transition hover:text-lime"
        @click="$emit('update:monthOffset', 0)"
      >Hoy</button>
    </div>

    <div class="mt-5 grid grid-cols-7 gap-1.5">
      <div
        v-for="h in WEEKDAY_HEADERS"
        :key="h"
        class="pb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500"
      >{{ h }}</div>

      <template v-for="cell in cells" :key="cell.key">
        <button
          v-if="cell.inMonth"
          class="relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm transition"
          :class="cellClass(cell)"
          @click="$emit('select', cell)"
        >
          <span class="font-semibold" :class="cellTextClass(cell)">{{ cell.date.getDate() }}</span>
          <span v-if="cell.isToday && !completedKeys.has(cell.key)" class="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-lime" />
        </button>
        <div v-else class="aspect-square rounded-xl" />
      </template>
    </div>

    <div class="mt-5 flex items-center justify-center gap-5 text-[11px] text-slate-500">
      <span class="flex items-center gap-1.5">
        <span class="h-3 w-3 rounded-md bg-lime" /> Completado
      </span>
      <span class="flex items-center gap-1.5">
        <span class="h-3 w-3 rounded-md border border-lime/40 bg-lime/5" /> Hoy
      </span>
      <span class="flex items-center gap-1.5">
        <span class="h-3 w-3 rounded-md border border-white/5 bg-white/[0.02]" /> Sin actividad
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { WEEKDAY_HEADERS, type MonthCell } from '~/composables/useCalendar'

const props = defineProps<{
  cells: MonthCell[]
  monthTitle: string
  monthOffset: number
  completedKeys: Set<string>
}>()
defineEmits<{ 'update:monthOffset': [number]; select: [MonthCell] }>()

function cellClass(cell: MonthCell): string {
  if (!cell.inMonth) return ''
  const done = props.completedKeys.has(cell.key)
  if (cell.isToday && done) return 'border-lime bg-lime'
  if (cell.isToday) return 'border-lime/40 bg-lime/5'
  if (done) return 'border-lime/30 bg-lime/15 hover:bg-lime/25'
  return 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:bg-white/5'
}

function cellTextClass(cell: MonthCell): string {
  if (cell.isToday) return 'text-ink-950'
  if (props.completedKeys.has(cell.key)) return 'text-ink-950'
  return 'text-slate-300'
}
</script>
