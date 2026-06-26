<template>
  <section v-if="info" class="surface animate-fade-up p-5">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ info.weekday }}</p>
        <p class="mt-0.5 text-lg font-bold text-white">{{ info.label }}</p>
      </div>
      <span v-if="info.session" class="chip bg-lime/15 text-lime">
        <AppIcon name="check" class="h-3.5 w-3.5" :stroke-width="3" /> Completado
      </span>
    </div>

    <div v-if="info.session" class="mt-4 flex items-center gap-3 rounded-xl bg-white/[0.02] px-3 py-3">
      <span class="grid h-9 w-9 place-items-center rounded-lg bg-lime/15 text-lime">
        <AppIcon name="dumbbell" class="h-4 w-4" />
      </span>
      <div class="flex-1">
        <p class="text-sm font-semibold text-white">{{ info.dayLabel }}</p>
        <p class="text-xs text-slate-500">{{ formatTime(info.session.date) }}</p>
      </div>
      <div v-if="info.session.durationMs > 0" class="text-right">
        <p class="text-xs text-slate-500">Duración</p>
        <p class="font-mono text-sm font-semibold text-lime">{{ formatDuration(Math.round(info.session.durationMs / 1000)) }}</p>
      </div>
      <NuxtLink :to="`/dia/${info.session.dayId}`" class="text-xs text-slate-400 transition hover:text-lime">Ver día</NuxtLink>
    </div>
    <p v-else class="mt-4 text-sm text-slate-400">Sin sesión registrada este día.</p>
  </section>
</template>

<script setup lang="ts">
import { formatDuration } from '~/composables/useTimer'
import type { RunSession } from '~/types'

interface SelectedInfo {
  weekday: string
  label: string
  session: RunSession | null
  dayLabel: string
}

defineProps<{ info: SelectedInfo | null }>()

function formatTime(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>
