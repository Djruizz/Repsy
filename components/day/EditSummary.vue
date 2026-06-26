<template>
  <section class="p-5 surface">
    <div class="flex items-center gap-3">
      <span class="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">{{ day.dayName }}</span>
      <label class="flex items-center gap-2 ml-auto text-xs cursor-pointer text-slate-400">
        <span>Día activo</span>
        <span
          class="relative h-5 transition rounded-full w-9"
          :class="day.enabled ? 'bg-lime' : 'bg-white/10'"
          @click="day.enabled = !day.enabled"
        >
          <span
            class="absolute top-0.5 h-4 w-4 rounded-full bg-ink-950 transition-all"
            :class="day.enabled ? 'left-[1.125rem]' : 'left-0.5'"
          />
        </span>
      </label>
    </div>

    <input
      v-model="day.routineName"
      class="w-full mt-3 text-2xl font-bold tracking-tight text-white bg-transparent outline-none placeholder:text-slate-600"
      placeholder="Nombre de la rutina"
    />
    <textarea
      v-model="day.description"
      rows="2"
      class="w-full mt-2 text-sm bg-transparent outline-none resize-none text-slate-400 placeholder:text-slate-600"
      placeholder="Descripción corta del día…"
    />
  </section>
</template>

<script setup lang="ts">
import type { Day } from '~/types'
defineProps<{ day: Day }>()
</script>
