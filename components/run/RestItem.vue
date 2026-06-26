<template>
  <section class="p-5 overflow-hidden surface-raised">
    <div class="flex items-center justify-between text-xs">
      <span class="font-mono text-slate-500">{{ index }} / {{ total }}</span>
      <span class="chip bg-white/5 text-slate-300">Descanso</span>
    </div>

    <div class="mt-4 animate-fade-up">
      <div class="flex items-center gap-2">
        <AppIcon name="rest" class="w-5 h-5 text-sky-400" />
        <h2 class="text-xl font-bold text-white">{{ item.label }}</h2>
      </div>
      <p class="mt-1.5 text-sm text-slate-400">Descanso de {{ formatDuration(item.duration) }}</p>

      <div class="flex flex-col items-center mt-6">
        <UiCountdownRing :progress="progress">
          <span class="font-mono text-3xl font-bold text-white tabular-nums">{{ formatTime(seconds) }}</span>
        </UiCountdownRing>
        <p v-if="finished" class="mt-4 text-sm font-semibold text-lime">¡Descanso completado!</p>
        <p v-else-if="!running && !paused" class="mt-4 text-xs text-slate-500">
          Pulsa iniciar para empezar el temporizador
        </p>
      </div>

      <!-- Add time -->
      <div v-if="!finished && (running || paused)" class="grid grid-cols-3 gap-2 mt-5">
        <button class="py-2 text-sm btn-ghost" @click="$emit('add', 15)">+15s</button>
        <button class="py-2 text-sm btn-ghost" @click="$emit('add', 30)">+30s</button>
        <button class="py-2 text-sm btn-ghost" @click="$emit('add', 60)">+60s</button>
      </div>

      <div class="grid grid-cols-2 gap-2 mt-3">
        <button
          v-if="!running && !paused && !finished"
          class="col-span-2 btn-primary"
          @click="$emit('begin')"
        >
          <AppIcon name="play" class="w-4 h-4" /> Iniciar descanso
        </button>
        <template v-else-if="!finished">
          <button v-if="running" class="btn-ghost" @click="$emit('pause')">
            <AppIcon name="pause" class="w-4 h-4" /> Pausar
          </button>
          <button v-else class="btn-ghost" @click="$emit('resume')">
            <AppIcon name="play" class="w-4 h-4" /> Reanudar
          </button>
          <button class="btn-primary" @click="$emit('skip')">
            <AppIcon name="skip" class="w-4 h-4" /> Saltar
          </button>
        </template>
        <button v-else class="col-span-2 btn-primary" @click="$emit('skip')">
          <AppIcon name="check" class="w-4 h-4" :stroke-width="3" /> Continuar
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatTime, formatDuration } from '~/composables/useTimer'
import type { Rest } from '~/types'

defineProps<{
  item: Rest
  index: number
  total: number
  seconds: number
  progress: number
  running: boolean
  paused: boolean
  finished: boolean
}>()

defineEmits<{ begin: []; pause: []; resume: []; skip: []; add: [number] }>()
</script>
