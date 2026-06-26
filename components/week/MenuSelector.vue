<template>
  <div class="flex gap-1.5 overflow-x-auto no-scrollbar">
    <button
      v-for="c in cells"
      :key="c.key"
      class="flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2.5 transition"
      :class="selectedKey === c.key
        ? 'border-lime/40 bg-lime/10 text-lime'
        : c.today
          ? 'border-lime/40 bg-lime/5 text-white'
          : 'border-white/5 bg-ink-850 text-slate-400 hover:text-slate-200'"
      @click="$emit('update:selectedKey', c.key)"
    >
      <span class="text-[10px] font-semibold uppercase tracking-wider">{{ shortWeekday(c.date) }}</span>
      <span
        class="grid text-sm font-bold rounded-lg h-7 w-7 place-items-center"
        :class="selectedKey === c.key ? 'bg-lime text-ink-950' : 'bg-white/5'"
      >{{ c.date.getDate() }}</span>
      <span v-if="c.completed" class="h-1.5 w-1.5 rounded-full bg-lime" />
      <span v-else-if="c.day?.items.length" class="h-1.5 w-1.5 rounded-full bg-slate-600" />
      <span v-else class="h-1.5 w-1.5 rounded-full bg-transparent" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { shortWeekday } from '~/composables/useCalendar'
import type { WeekCell } from '~/types'

defineProps<{ cells: WeekCell[]; selectedKey: string }>()
defineEmits<{ 'update:selectedKey': [string] }>()
</script>
