<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-bold tracking-wider text-white uppercase">
        Rutina <span class="text-slate-500">· {{ items.length }}</span>
      </h2>
    </div>

    <TransitionGroup name="list" tag="div" class="space-y-2.5">
      <RoutineItemCard
        v-for="(item, idx) in items"
        :key="item.id"
        :item="item"
        :index="idx"
        editable
      >
        <template #actions>
          <RoutineItemEditControls
            :index="idx"
            :last-index="items.length - 1"
            @move="(dir) => $emit('move', item.id, dir)"
            @edit="$emit('edit', item)"
            @remove="$emit('remove', item.id)"
          />
        </template>
      </RoutineItemCard>
    </TransitionGroup>

    <div v-if="!items.length" class="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center surface">
      <AppIcon name="dumbbell" class="w-8 h-8 text-slate-600" />
      <p class="text-sm text-slate-400">Aún no hay ejercicios en este día.</p>
      <p class="text-xs text-slate-500">Añade ejercicios o descansos para empezar.</p>
    </div>

    <div class="flex flex-col gap-2 sm:flex-row">
      <button class="flex-1 btn-ghost" @click="$emit('add-exercise')">
        <AppIcon name="plus" class="w-4 h-4" /> Añadir ejercicio
      </button>
      <button class="flex-1 btn-ghost" @click="$emit('add-rest')">
        <AppIcon name="clock" class="w-4 h-4" /> Añadir descanso
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { RoutineItem } from '~/types'
defineProps<{ items: RoutineItem[] }>()
defineEmits<{
  move: [string, -1 | 1]
  edit: [RoutineItem]
  remove: [string]
  'add-exercise': []
  'add-rest': []
}>()
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.list-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
.list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
