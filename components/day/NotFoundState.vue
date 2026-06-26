<template>
  <div class="grid py-24 text-center place-items-center">
    <div>
      <p class="text-sm text-slate-400">No se encontró este día.</p>
      <button class="mt-4 btn-ghost" @click="$emit('back')">Volver a la semana</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ back: [] }>()
</script>
