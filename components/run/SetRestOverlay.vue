<template>
  <section
    class="fixed inset-x-0 bottom-0 z-50 px-5 pt-5 pb-8 border-b-0 rounded-b-none surface-raised rounded-t-3xl sm:inset-x-4 sm:mx-auto sm:max-w-sm sm:rounded-t-3xl"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <AppIcon name="rest" class="w-5 h-5 text-sky-400" />
        <span class="text-sm font-bold text-white">Descanso entre series</span>
      </div>
      <span class="text-xs text-slate-400">Serie {{ setIdx + 1 }} → {{ setIdx + 2 }}</span>
    </div>

    <div class="flex items-center gap-4 mt-4">
      <UiCountdownRing :size="80" :radius="36" :stroke-width="4" :progress="progress">
        <span class="font-mono text-xl font-bold text-white tabular-nums">{{ formatTime(seconds) }}</span>
      </UiCountdownRing>

      <div class="flex-1">
        <p v-if="finished" class="text-sm font-semibold text-lime">¡Descanso completado!</p>
        <p v-else class="text-sm text-slate-400">Próxima serie lista en {{ seconds }}s</p>
        <div class="flex gap-2 mt-3">
          <button v-if="running" class="flex-1 text-xs btn-ghost" @click="$emit('pause')">
            <AppIcon name="pause" class="w-4 h-4" /> Pausar
          </button>
          <button v-else-if="!finished" class="flex-1 text-xs btn-ghost" @click="$emit('resume')">
            <AppIcon name="play" class="w-4 h-4" /> Reanudar
          </button>
          <button class="flex-1 text-xs btn-primary" @click="$emit('end')">
            <AppIcon name="skip" class="w-4 h-4" />
            {{ finished ? 'Continuar' : 'Saltar' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatTime } from '~/composables/useTimer'
defineProps<{
  setIdx: number
  seconds: number
  progress: number
  running: boolean
  finished: boolean
}>()
defineEmits<{ pause: []; resume: []; end: [] }>()
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
