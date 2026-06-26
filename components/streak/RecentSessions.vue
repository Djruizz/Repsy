<template>
  <section>
    <h2 class="label mb-2">Sesiones recientes</h2>
    <div v-if="entries.length" class="space-y-2">
      <div v-for="s in entries" :key="s.id" class="surface flex items-center gap-3 p-3.5">
        <span class="grid h-9 w-9 place-items-center rounded-lg bg-lime/15 text-lime">
          <AppIcon name="check" class="h-4 w-4" :stroke-width="3" />
        </span>
        <div class="flex-1">
          <p class="text-sm font-semibold text-white">{{ s.dayLabel }}</p>
          <p class="text-xs text-slate-500">{{ formatDate(s.date) }}</p>
        </div>
        <span v-if="s.durationMs > 0" class="chip bg-white/5 text-slate-300">
          <AppIcon name="timer" class="h-3.5 w-3.5" />
          <b class="font-mono text-slate-200">{{ formatDuration(Math.round(s.durationMs / 1000)) }}</b>
        </span>
        <NuxtLink :to="`/dia/${s.dayId}`" class="text-xs text-slate-400 transition hover:text-lime">Ver día</NuxtLink>
      </div>
    </div>
    <UiEmptyState
      v-else
      icon="flame"
      title="Aún no has completado ninguna sesión."
      subtitle="Corre una rutina para empezar tu racha."
    />
  </section>
</template>

<script setup lang="ts">
import { formatDuration } from '~/composables/useTimer'

interface RecentEntry {
  id: string
  dayId: string
  dayLabel: string
  date: string
  durationMs: number
}

defineProps<{ entries: RecentEntry[] }>()

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}
</script>
