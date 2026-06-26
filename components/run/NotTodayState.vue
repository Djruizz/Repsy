<template>
  <div class="grid py-24 text-center place-items-center">
    <div class="flex flex-col items-center gap-3">
      <AppIcon name="calendar" class="w-10 h-10 text-slate-500" />
      <h2 class="text-lg font-bold text-white">No es el día de hoy</h2>
      <p class="max-w-xs text-sm text-slate-400">
        Solo puedes correr la rutina del día de hoy ({{ todayDayName }}).
        Esta rutina corresponde a <b class="text-slate-200">{{ dayName }}</b>.
      </p>
      <button class="mt-1 btn-primary" @click="$emit('back')">
        <AppIcon name="arrow-left" class="w-4 h-4" /> Ver día
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ todayDayName: string; dayName: string }>()
defineEmits<{ back: [] }>()
</script>
