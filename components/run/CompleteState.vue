<template>
  <section class="flex flex-col items-center gap-3 px-4 py-12 text-center surface">
    <AppIcon name="check" class="w-10 h-10 text-lime" :stroke-width="3" />
    <h2 class="text-lg font-bold text-white">¡Rutina completada!</h2>
    <p class="text-sm text-slate-400">Has terminado todos los ejercicios del día.</p>
    <button class="mt-1 btn-primary" @click="$emit('finish')">
      <AppIcon name="check" class="w-4 h-4" :stroke-width="3" /> Finalizar sesión
    </button>
  </section>
</template>

<script setup lang="ts">
defineEmits<{ finish: [] }>()
</script>
