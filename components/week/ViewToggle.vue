<template>
  <div class="flex justify-center">
    <div class="inline-flex p-1 border rounded-xl border-white/5 bg-ink-850">
      <button
        class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="modelValue === 'list' ? 'bg-lime text-ink-950' : 'text-slate-400 hover:text-slate-200'"
        @click="$emit('update:modelValue', 'list')"
      >
        <AppIcon name="list" class="w-4 h-4" /> Lista
      </button>
      <button
        class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
        :class="modelValue === 'menu' ? 'bg-lime text-ink-950' : 'text-slate-400 hover:text-slate-200'"
        @click="$emit('update:modelValue', 'menu')"
      >
        <AppIcon name="grid" class="w-4 h-4" /> Menú semanal
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: 'list' | 'menu' }>()
defineEmits<{ 'update:modelValue': ['list' | 'menu'] }>()
</script>
