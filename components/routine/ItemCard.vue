<template>
  <div class="p-4 surface-raised" :class="{ 'group': editable }">
    <div class="flex items-start gap-3">
      <span
        class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/5 font-mono text-xs font-bold text-slate-400"
      >{{ index + 1 }}</span>

      <div class="flex-1 min-w-0">
        <template v-if="item.type === 'exercise'">
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-base font-semibold text-white truncate">{{ item.name }}</h3>
            <MuscleBadge :group="item.muscle_group" />
            <span
              class="chip bg-white/5 text-slate-400"
              :title="item.score_by === 'time' ? 'Por tiempo' : 'Por repeticiones'"
            >
              <AppIcon :name="item.score_by === 'time' ? 'timer' : 'dumbbell'" class="h-3.5 w-3.5" />
              {{ item.score_by === 'time' ? 'Tiempo' : 'Reps' }}
            </span>
          </div>
          <div class="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
            <span class="inline-flex items-center gap-1.5">
              <b class="font-mono text-slate-200">{{ item.sets }}</b> series
            </span>
            <span v-if="item.score_by === 'reps'" class="inline-flex items-center gap-1.5">
              <b class="font-mono text-slate-200">{{ item.reps_range }}</b> reps
            </span>
            <span v-else class="inline-flex items-center gap-1.5">
              <b class="font-mono text-slate-200">{{ formatDuration(item.time) }}</b> por serie
            </span>
            <span class="inline-flex items-center gap-1.5">
              RPE <b class="font-mono text-lime">{{ item.rpe }}</b>
            </span>
            <span v-if="item.rest_between_sets" class="inline-flex items-center gap-1.5">
              <AppIcon name="rest" class="h-3.5 w-3.5 text-sky-400" />
              {{ formatDuration(item.rest_between_sets) }}
            </span>
          </div>
        </template>

        <template v-else>
          <div class="flex items-center gap-2">
            <AppIcon name="rest" class="w-4 h-4 text-sky-400" />
            <h3 class="text-base font-semibold text-white">{{ item.label }}</h3>
          </div>
          <p class="mt-2 text-xs text-slate-400">
            {{ durationLabel }}:
            <b class="font-mono text-sky-300">{{ formatDuration(item.duration) }}</b>
          </p>
        </template>
      </div>

      <div v-if="editable" class="flex items-center gap-1 shrink-0">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDuration } from '~/composables/useTimer'
import type { RoutineItem } from '~/types'

withDefaults(defineProps<{ item: RoutineItem; index: number; editable?: boolean; durationLabel?: string }>(), {
  editable: false,
  durationLabel: 'Duración',
})
</script>
