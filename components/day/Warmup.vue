<template>
  <section v-if="editable || modelValue" class="p-5 surface">
    <div class="flex items-center gap-2">
      <AppIcon name="sparkles" class="w-4 h-4 text-lime" />
      <h2 class="text-sm font-bold tracking-wider text-white uppercase">Calentamiento</h2>
    </div>
    <p
      v-if="!editable"
      class="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-slate-300"
    >{{ modelValue }}</p>
    <textarea
      v-else
      :value="modelValue"
      rows="3"
      class="w-full p-3 mt-3 text-sm transition border outline-none resize-none rounded-xl border-white/5 bg-ink-900/60 text-slate-300 focus:border-lime/40"
      placeholder="Escribe un párrafo con los ejercicios de calentamiento (no se cuenta como ejercicio)…"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ modelValue: string; editable?: boolean }>(), { editable: false })
defineEmits<{ 'update:modelValue': [string] }>()
</script>
