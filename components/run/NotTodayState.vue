<template>
  <div class="grid py-24 text-center place-items-center">
    <div class="flex flex-col items-center gap-3">
      <AppIcon name="calendar" class="w-10 h-10 text-slate-500" />
      <h2 class="text-lg font-bold text-white">Hoy es {{ todayDayName }}</h2>
      <p class="max-w-xs text-sm text-slate-400">
        Esta rutina corresponde a <b class="text-slate-200">{{ dayName }}</b>.
        Puedes correrla de todas formas como recuperación.
      </p>
      <div class="flex gap-2">
        <button class="btn-ghost" @click="$emit('back')">
          <AppIcon name="arrow-left" class="w-4 h-4" /> Ver día
        </button>
        <button class="btn-primary" @click="$emit('runAnyway')">
          <AppIcon name="play" class="w-4 h-4" /> Correr de todas formas
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ todayDayName: string; dayName: string }>()
defineEmits<{ back: []; runAnyway: [] }>()
</script>
