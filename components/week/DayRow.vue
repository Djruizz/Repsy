<template>
  <div
    class="relative flex items-center w-full gap-4 p-4 overflow-hidden transition cursor-pointer surface group hover:border-white/10 hover:bg-ink-800"
    :class="!cell.day?.enabled ? 'opacity-50' : ''"
    @click="cell.day?.enabled ? $emit('open', cell.date) : undefined"
  >
    <div class="flex flex-col items-center shrink-0">
      <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{{ shortWeekday(cell.date) }}</span>
      <span
        class="grid mt-1 text-base font-bold h-9 w-9 place-items-center rounded-xl"
        :class="cell.today ? 'bg-lime text-ink-950' : 'bg-white/5 text-slate-300'"
      >{{ cell.date.getDate() }}</span>
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <p v-if="cell.day?.routineName" class="text-base font-semibold text-white truncate">{{ cell.day.routineName }}</p>
        <p v-else class="text-base font-semibold text-slate-500">Día libre</p>
        <span v-if="cell.completed" class="chip shrink-0 bg-lime/15 text-lime">
          <AppIcon name="check" class="w-3 h-3" :stroke-width="3" />
        </span>
        <span v-if="cell.day && !cell.day.enabled" class="chip shrink-0 bg-white/5 text-slate-500">Inactivo</span>
      </div>
      <p v-if="cell.day?.description" class="mt-0.5 line-clamp-1 text-xs text-slate-400">{{ cell.day.description }}</p>
      <div class="flex items-center gap-3 mt-2 text-xs text-slate-400">
        <span v-if="exCount" class="inline-flex items-center gap-1.5">
          <AppIcon name="dumbbell" class="h-3.5 w-3.5" />
          {{ exCount }} ejercicios
        </span>
        <span v-if="restCount" class="inline-flex items-center gap-1.5">
          <AppIcon name="clock" class="h-3.5 w-3.5" />
          {{ restCount }}
        </span>
        <span v-if="cell.day?.enabled && !cell.day?.items.length" class="text-slate-500">
          {{ cell.day?.routineName ? 'Sin ejercicios' : 'Añadir rutina' }}
        </span>
      </div>
    </div>

    <div class="flex items-center gap-2 shrink-0">
      <button
        v-if="cell.day && !cell.day.enabled"
        class="px-3 py-2 text-xs btn-ghost text-lime hover:bg-lime/10"
        @click.stop="$emit('activate', cell.day!.id)"
      >
        <AppIcon name="check" class="w-4 h-4" :stroke-width="3" /> Activar
      </button>
      <span v-else class="text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-lime">
        <AppIcon name="arrow-right" class="w-5 h-5" />
      </span>
    </div>

    <div
      class="absolute w-20 h-20 transition rounded-full opacity-0 -right-6 -top-6 blur-2xl group-hover:opacity-100"
      :class="cell.today ? 'bg-lime/20' : 'bg-white/5'"
    />
  </div>
</template>

<script setup lang="ts">
import { shortWeekday } from '~/composables/useCalendar'
import type { WeekCell } from '~/types'

const props = defineProps<{ cell: WeekCell }>()
defineEmits<{ open: [Date]; activate: [string] }>()

const exCount = computed(() => props.cell.day?.items.filter((i) => i.type === 'exercise').length || 0)
const restCount = computed(() => props.cell.day?.items.filter((i) => i.type === 'rest').length || 0)
</script>
