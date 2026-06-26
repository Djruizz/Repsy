<template>
  <div class="flex items-center gap-1">
    <button
      class="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-white/5 hover:text-white disabled:opacity-30"
      :disabled="index === 0"
      @click="$emit('move', -1)"
    >
      <AppIcon name="chevron-up" class="w-4 h-4" />
    </button>
    <button
      class="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-white/5 hover:text-white disabled:opacity-30"
      :disabled="index === lastIndex"
      @click="$emit('move', 1)"
    >
      <AppIcon name="chevron-down" class="w-4 h-4" />
    </button>
    <button
      class="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-white/5 hover:text-lime"
      @click="$emit('edit')"
    >
      <AppIcon name="edit" class="w-4 h-4" />
    </button>
    <button
      class="grid h-7 w-7 place-items-center rounded-md text-slate-500 transition hover:bg-ember/10 hover:text-ember"
      @click="$emit('remove')"
    >
      <AppIcon name="trash" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ index: number; lastIndex: number }>()
defineEmits<{ move: [-1 | 1]; edit: []; remove: [] }>()
</script>
