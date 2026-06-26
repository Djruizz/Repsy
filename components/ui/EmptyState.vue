<template>
  <div class="surface flex flex-col items-center gap-2 px-4 py-10 text-center">
    <slot name="icon">
      <AppIcon :name="icon" class="h-8 w-8 text-slate-600" />
    </slot>
    <p v-if="title" class="text-sm text-slate-400">{{ title }}</p>
    <p v-if="subtitle" class="text-xs text-slate-500">{{ subtitle }}</p>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ icon?: string; title?: string; subtitle?: string }>(), {
  icon: 'dumbbell',
  title: '',
  subtitle: '',
})
</script>
