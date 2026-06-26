<template>
  <section class="space-y-3">
    <h2 class="text-sm font-bold tracking-wider text-white uppercase">
      Rutina <span class="text-slate-500">· {{ items.length }}</span>
    </h2>

    <div class="space-y-2.5">
      <RoutineItemCard
        v-for="(item, idx) in items"
        :key="item.id"
        :item="item"
        :index="idx"
      />
    </div>

    <div v-if="!items.length" class="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center surface">
      <AppIcon name="dumbbell" class="w-8 h-8 text-slate-600" />
      <p class="text-sm text-slate-400">Aún no hay ejercicios en este día.</p>
      <button class="btn-ghost" @click="$emit('add')">
        <AppIcon name="plus" class="w-4 h-4" /> Añadir ejercicios
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { RoutineItem } from '~/types'
defineProps<{ items: RoutineItem[] }>()
defineEmits<{ add: [] }>()
</script>
