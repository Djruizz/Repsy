<template>
  <div class="grid min-h-screen place-items-center px-6">
    <div class="text-center">
      <p class="font-mono text-5xl font-bold text-lime">{{ error?.statusCode || 500 }}</p>
      <p class="mt-3 text-sm text-slate-400">{{ error?.message || 'Algo salió mal.' }}</p>
      <button class="btn-primary mt-6" @click="handleClear">Volver al inicio</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
defineProps<{ error: NuxtError }>()
function handleClear() { clearError({ redirect: '/' }) }
</script>
