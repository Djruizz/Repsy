<template>
  <div class="grid py-24 text-center place-items-center">
    <div class="flex flex-col items-center gap-3">
      <AppIcon name="check" class="w-10 h-10 text-lime" :stroke-width="3" />
      <h2 class="text-lg font-bold text-white">Rutina completada</h2>
      <p class="max-w-xs text-sm text-slate-400">
        Ya finalizaron esta rutina hoy. No puedes volver a correrla hasta mañana.
      </p>
      <button class="mt-1 btn-primary" @click="$emit('back')">
        <AppIcon name="arrow-left" class="w-4 h-4" /> Volver al día
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ back: [] }>()
</script>
