<template>
  <section>
    <p class="mb-2 label">Progreso</p>
    <div class="space-y-1.5">
      <div
        v-for="(item, idx) in items"
        :key="item.id"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition"
        :class="idx === currentIdx ? 'bg-lime/10' : 'bg-white/[0.02]'"
      >
        <span
          class="grid w-6 h-6 text-xs rounded-md place-items-center"
          :class="isItemDone(item) ? 'bg-lime text-ink-950' : 'bg-white/5 text-slate-400'"
        >
          <AppIcon v-if="isItemDone(item)" name="check" class="h-3.5 w-3.5" :stroke-width="3" />
          <span v-else class="font-mono">{{ idx + 1 }}</span>
        </span>
        <span
          class="flex-1 text-sm truncate"
          :class="isItemDone(item) ? 'text-slate-500 line-through' : 'text-slate-200'"
        >
          {{ item.type === 'exercise' ? item.name : item.label }}
        </span>
        <span v-if="item.type === 'exercise'" class="text-xs text-slate-500">
          {{ doneSets(item) }}/{{ item.sets }}
        </span>
        <span v-else-if="isItemDone(item)" class="chip bg-sky-400/15 text-sky-300">Hecho</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { RoutineItem, Exercise, RunSession, SetState } from '~/types'

const props = defineProps<{ items: RoutineItem[]; currentIdx: number; session: RunSession | null }>()

function setKey(id: string, i: number): string {
  return `${id}:${i}`
}

function setState(item: Exercise, i: number): SetState {
  return props.session?.setStates[setKey(item.id, i)] ?? 'pending'
}

function isExerciseComplete(item: Exercise): boolean {
  for (let i = 0; i < item.sets; i++) {
    const s = props.session?.setStates[setKey(item.id, i)]
    if (s !== 'done' && s !== 'skipped') return false
  }
  return true
}

function isItemDone(item: RoutineItem): boolean {
  if (item.type === 'rest') return props.session?.itemStates[item.id] === 'done'
  return isExerciseComplete(item) || props.session?.itemStates[item.id] === 'done'
}

function doneSets(item: Exercise): number {
  let n = 0
  for (let i = 0; i < item.sets; i++) if (setState(item, i) !== 'pending') n++
  return n
}
</script>
