<template>
  <div class="flex gap-1.5 overflow-x-auto no-scrollbar">
    <button
      v-for="name in names"
      :key="name"
      class="shrink-0 rounded-xl border px-3 py-2 text-xs font-medium transition"
      :class="modelValue === name ? 'border-lime/40 bg-lime/10 text-lime' : 'border-white/5 bg-ink-850 text-slate-400 hover:text-slate-200'"
      @click="$emit('update:modelValue', name)"
    >
      {{ name }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ names: string[]; modelValue: string }>()
defineEmits<{ 'update:modelValue': [string] }>()
</script>
