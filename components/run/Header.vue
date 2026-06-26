<template>
  <div class="flex items-center justify-between">
    <button class="px-3 py-2 text-xs btn-ghost" @click="$emit('leave')">
      <AppIcon name="arrow-left" class="w-4 h-4" /> Salir
    </button>
    <div class="text-center">
      <p class="text-xs tracking-wider uppercase text-slate-500">{{ dayName }}</p>
      <p class="text-sm font-bold text-white">{{ routineName || 'Rutina' }}</p>
      <p class="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-slate-400 tabular-nums">
        <AppIcon name="timer" class="h-3.5 w-3.5" />
        {{ formatTime(seconds) }}
      </p>
    </div>
    <button class="px-3 py-2 text-xs btn-primary" @click="$emit('finish')">
      <AppIcon name="check" class="w-4 h-4" :stroke-width="3" /> Finalizar
    </button>
  </div>
</template>

<script setup lang="ts">
import { formatTime } from '~/composables/useTimer'
defineProps<{ dayName: string; routineName: string; seconds: number }>()
defineEmits<{ leave: []; finish: [] }>()
</script>
