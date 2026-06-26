<template>
  <section class="p-5 overflow-hidden surface-raised">
    <div class="flex items-center justify-between text-xs">
      <span class="font-mono text-slate-500">{{ index }} / {{ total }}</span>
      <span class="chip bg-white/5 text-slate-300">Ejercicio</span>
    </div>

    <div class="mt-4 animate-fade-up">
      <div class="flex flex-wrap items-center gap-2">
        <h2 class="text-xl font-bold text-white">{{ item.name }}</h2>
        <MuscleBadge :group="item.muscle_group" />
        <span class="chip bg-white/5 text-slate-400" :title="item.score_by === 'time' ? 'Por tiempo' : 'Por repeticiones'">
          <AppIcon :name="item.score_by === 'time' ? 'timer' : 'dumbbell'" class="h-3.5 w-3.5" />
          {{ item.score_by === 'time' ? 'Tiempo' : 'Reps' }}
        </span>
      </div>
      <p class="mt-1.5 text-sm text-slate-400">
        {{ item.sets }} series ·
        <template v-if="item.score_by === 'reps'">{{ item.reps_range }} reps</template>
        <template v-else>{{ formatDuration(item.time) }} por serie</template>
        · RPE {{ item.rpe }}
        <span v-if="item.rest_between_sets">· descanso {{ formatDuration(item.rest_between_sets) }}</span>
      </p>

      <p class="mt-5 label">Series · completa en orden</p>
      <div class="mt-2.5 flex flex-wrap gap-2.5">
        <button
          v-for="i in item.sets"
          :key="i"
          class="relative grid text-lg font-bold transition border-2 h-14 w-14 place-items-center rounded-2xl active:scale-95"
          :class="setClass(i - 1)"
          :disabled="!canClickSet(i - 1)"
          @click="$emit('cycleSet', i - 1)"
        >
          {{ i }}
          <AppIcon v-if="setState(i - 1) === 'done'" name="check" class="absolute bottom-1 h-3.5 w-3.5" :stroke-width="3" />
          <span v-if="setState(i - 1) === 'skipped'" class="absolute bottom-1.5 h-0.5 w-5 rounded bg-current" />
        </button>
      </div>

      <!-- REPS MODE: weight input for the active set -->
      <div
        v-if="item.score_by === 'reps' && activeSetIdxNum >= 0 && !setRestActive"
        class="flex items-center gap-3 p-3 mt-4 border rounded-xl border-white/5 bg-ink-900/60"
      >
        <div class="flex flex-col">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Serie {{ activeSetIdxNum + 1 }} · peso</span>
          <div class="flex items-baseline gap-1 mt-1">
            <input
              :value="currentWeight"
              type="number"
              inputmode="decimal"
              min="0"
              step="0.5"
              class="w-20 text-2xl font-bold text-white bg-transparent outline-none placeholder:text-slate-600"
              placeholder="0"
              @input="$emit('update:currentWeight', parseFloat(($event.target as HTMLInputElement).value) || 0)"
              @keydown.enter="$emit('completeSetWithWeight', activeSetIdxNum)"
            />
            <span class="text-sm font-medium text-slate-400">kg</span>
          </div>
        </div>
        <button class="btn-primary ml-auto px-4 py-2.5 text-sm" @click="$emit('completeSetWithWeight', activeSetIdxNum)">
          <AppIcon name="check" class="w-4 h-4" :stroke-width="3" /> Completar serie
        </button>
      </div>

      <!-- TIME MODE: set timer for the active set -->
      <div
        v-else-if="item.score_by === 'time' && activeSetIdxNum >= 0 && !setRestActive && !setTime.active"
        class="mt-4 flex flex-col items-center gap-4 p-4 border rounded-xl border-white/5 bg-ink-900/60"
      >
        <div class="flex items-baseline gap-1">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Serie {{ activeSetIdxNum + 1 }} ·</span>
          <span class="font-mono text-sm text-slate-400">{{ formatDuration(item.time) }}</span>
        </div>
        <button class="btn-primary w-full" @click="$emit('startSetTime', activeSetIdxNum)">
          <AppIcon name="play" class="w-4 h-4" /> Iniciar temporizador
        </button>
      </div>

      <!-- TIME MODE: running timer -->
      <div
        v-else-if="item.score_by === 'time' && setTime.active"
        class="flex flex-col items-center gap-4 p-5 mt-4 border rounded-xl border-sky-400/20 bg-sky-400/5"
      >
        <span class="text-[10px] font-semibold uppercase tracking-wider text-sky-300">
          Serie {{ setTime.setIdx + 1 }} en marcha
        </span>
        <UiCountdownRing :progress="setTime.progress">
          <span class="font-mono text-3xl font-bold text-white tabular-nums">{{ formatTime(setTime.seconds) }}</span>
        </UiCountdownRing>
        <div class="grid grid-cols-2 gap-2 w-full">
          <button v-if="setTime.running" class="btn-ghost" @click="$emit('pauseSetTime')">
            <AppIcon name="pause" class="w-4 h-4" /> Pausar
          </button>
          <button v-else class="btn-ghost" @click="$emit('resumeSetTime')">
            <AppIcon name="play" class="w-4 h-4" /> Reanudar
          </button>
          <button class="btn-primary" @click="$emit('completeTimeSet', setTime.setIdx)">
            <AppIcon name="check" class="w-4 h-4" :stroke-width="3" />
            {{ setTime.finished ? 'Continuar' : 'Completar' }}
          </button>
        </div>
      </div>

      <!-- Show recorded weights for completed sets -->
      <div v-if="hasRecordedWeights" class="flex flex-wrap gap-2 mt-3 text-xs">
        <span
          v-for="i in item.sets"
          :key="i"
          v-show="getSetWeight(i - 1) != null"
          class="chip bg-white/5 text-slate-300"
        >
          S{{ i }}: <b class="font-mono text-slate-200">{{ getSetWeight(i - 1) }}</b> kg
        </span>
      </div>

      <div class="flex gap-2 mt-5">
        <button class="flex-1 btn-ghost" @click="$emit('skipExercise')">
          <AppIcon name="skip" class="w-4 h-4" /> Saltar ejercicio
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatTime, formatDuration } from '~/composables/useTimer'
import type { Exercise, RunSession, SetState } from '~/types'

const props = defineProps<{
  item: Exercise
  index: number
  total: number
  session: RunSession | null
  setRestActive: boolean
  setTime: { active: boolean; setIdx: number; seconds: number; progress: number; running: boolean; finished: boolean }
  currentWeight: number
}>()

defineEmits<{
  cycleSet: [number]
  completeSetWithWeight: [number]
  startSetTime: [number]
  completeTimeSet: [number]
  skipExercise: []
  pauseSetTime: []
  resumeSetTime: []
  'update:currentWeight': [number]
}>()

function setKey(i: number): string {
  return `${props.item.id}:${i}`
}

function setState(i: number): SetState {
  return props.session?.setStates[setKey(i)] ?? 'pending'
}

function firstPendingSetIdx(): number {
  for (let i = 0; i < props.item.sets; i++) {
    if (setState(i) === 'pending') return i
  }
  return -1
}

const activeSetIdxNum = computed(() => firstPendingSetIdx())

function setClass(i: number): string {
  const s = setState(i)
  if (s === 'done') return 'border-lime bg-lime text-ink-950'
  if (s === 'skipped') return 'border-ember/50 bg-ember/10 text-ember line-through'
  const activeIdx = firstPendingSetIdx()
  if (i === activeIdx && !props.setRestActive && !props.setTime.active) return 'border-sky-400/60 bg-sky-400/10 text-sky-300 animate-pulse'
  return 'border-white/10 bg-ink-800 text-slate-600 opacity-50'
}

function canClickSet(i: number): boolean {
  if (props.setRestActive || props.setTime.active) return false
  const s = setState(i)
  if (s !== 'pending') return true
  return i === firstPendingSetIdx()
}

function getSetWeight(i: number): number | null {
  const w = props.session?.setWeights[setKey(i)]
  return w != null ? w : null
}

const hasRecordedWeights = computed(() => {
  for (let i = 0; i < props.item.sets; i++) {
    if (getSetWeight(i) != null) return true
  }
  return false
})
</script>
