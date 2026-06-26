<template>
  <section class="p-5 surface">
    <div class="flex items-center gap-2">
      <span class="text-xs font-semibold tracking-wider uppercase text-slate-400">{{ day.dayName }}</span>
      <span v-if="!day.enabled" class="chip bg-white/5 text-slate-500">Inactivo</span>
    </div>
    <h1 class="mt-2 text-2xl font-bold tracking-tight text-white">{{ day.routineName || 'Día libre' }}</h1>
    <p v-if="day.description" class="mt-2 text-sm text-slate-400">{{ day.description }}</p>
    <p v-else class="mt-2 text-sm text-slate-600">Sin descripción</p>
  </section>
</template>

<script setup lang="ts">
import type { Day } from '~/types'
defineProps<{ day: Day }>()
</script>
