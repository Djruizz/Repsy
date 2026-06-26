<template>
  <div class="surface p-4">
    <p class="text-2xl font-bold" :class="accent">
      <slot>{{ value }}</slot>
      <span v-if="unit" class="text-sm text-slate-400">{{ unit }}</span>
    </p>
    <p class="mt-1 text-xs text-slate-400">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ value?: string | number; unit?: string; label: string; accent?: string }>(), {
  accent: 'text-white',
  value: '',
  unit: '',
})
</script>
