<template>
  <div v-if="cell" class="p-5 surface animate-fade-up">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold tracking-wider uppercase text-slate-400">{{ cell.day?.dayName }}</span>
          <span v-if="cell.completed" class="chip bg-lime/15 text-lime">
            <AppIcon name="check" class="w-3 h-3" :stroke-width="3" />
            Completado
          </span>
          <span v-if="cell.day && !cell.day.enabled" class="chip bg-white/5 text-slate-500">Inactivo</span>
        </div>
        <h2 class="mt-1.5 text-xl font-bold text-white">{{ cell.day?.routineName || 'Día libre' }}</h2>
        <p v-if="cell.day?.description" class="mt-1.5 text-sm text-slate-400">{{ cell.day.description }}</p>
      </div>
      <div class="flex flex-col items-end gap-2 shrink-0">
        <button
          v-if="cell.day && !cell.day.enabled"
          class="px-3 py-2 text-xs btn-ghost text-lime hover:bg-lime/10"
          @click="$emit('activate', cell.day!.id)"
        >
          <AppIcon name="check" class="w-4 h-4" :stroke-width="3" /> Activar día
        </button>
        <button
          v-else
          class="px-3 py-2 text-xs btn-primary"
          @click="$emit('navigate', cell.day!.id, !!cell.day?.items.length)"
        >
          {{ cell.day?.items.length ? 'Abrir' : 'Editar' }}
          <AppIcon name="arrow-right" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div v-if="cell.day?.items.length" class="mt-5 space-y-1.5">
      <div
        v-for="(item, idx) in cell.day.items"
        :key="item.id"
        class="flex items-center gap-3 rounded-xl bg-white/[0.02] px-3 py-2.5"
      >
        <span class="grid w-6 h-6 font-mono text-xs font-bold rounded-md shrink-0 place-items-center bg-white/5 text-slate-400">{{ idx + 1 }}</span>
        <template v-if="item.type === 'exercise'">
          <span class="flex-1 text-sm font-medium truncate text-slate-200">{{ item.name }}</span>
          <span v-if="item.rest_between_sets" class="chip shrink-0 bg-sky-400/10 text-sky-300">
            <AppIcon name="rest" class="w-3 h-3" />
            {{ formatDuration(item.rest_between_sets) }}
          </span>
          <MuscleBadge :group="item.muscle_group" />
        </template>
        <template v-else>
          <AppIcon name="rest" class="w-4 h-4 shrink-0 text-sky-400" />
          <span class="flex-1 text-sm font-medium truncate text-slate-200">{{ item.label }}</span>
          <span class="chip shrink-0 bg-sky-400/10 text-sky-300">{{ formatDuration(item.duration) }}</span>
        </template>
      </div>
    </div>

    <div v-else class="flex flex-col items-center gap-2 py-8 mt-5 text-center">
      <AppIcon name="dumbbell" class="h-7 w-7 text-slate-600" />
      <p class="text-sm text-slate-400">Sin ejercicios este día.</p>
      <button
        v-if="cell.day?.enabled"
        class="px-3 py-2 mt-1 text-xs btn-ghost"
        @click="$emit('navigate', cell.day!.id, false)"
      >
        <AppIcon name="plus" class="w-4 h-4" /> Añadir ejercicios
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDuration } from '~/composables/useTimer'
import type { WeekCell } from '~/types'

defineProps<{ cell?: WeekCell }>()
defineEmits<{ activate: [string]; navigate: [string, boolean] }>()
</script>
