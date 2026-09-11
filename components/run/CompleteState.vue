<template>
  <section class="flex flex-col items-center gap-3 px-4 py-12 text-center surface">
    <AppIcon name="check" class="w-10 h-10 text-lime" :stroke-width="3" />
    <h2 class="text-lg font-bold text-white">¡Rutina completada!</h2>
    <p class="text-sm text-slate-400">Has terminado todos los ejercicios del día.</p>

    <p v-if="autoActive" class="text-xs font-semibold text-sky-300">
      Finalizando automáticamente en {{ autoSeconds }}s…
    </p>

    <div class="flex gap-2">
      <button v-if="autoActive" class="btn-ghost" @click="$emit('cancel')">
        Cancelar
      </button>
      <button class="btn-primary" @click="$emit('finish')">
        <AppIcon name="check" class="w-4 h-4" :stroke-width="3" /> Finalizar sesión
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    autoSeconds?: number
    autoActive?: boolean
  }>(),
  { autoSeconds: 0, autoActive: false },
)
defineEmits<{ finish: []; cancel: [] }>()
</script>
