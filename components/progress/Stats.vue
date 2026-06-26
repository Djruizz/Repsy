<template>
  <section class="grid grid-cols-3 gap-3">
    <UiStatCard label="Peso máximo" accent="text-lime">
      {{ maxWeight }} <span class="text-sm text-slate-400">kg</span>
    </UiStatCard>
    <UiStatCard label="Último registro">
      {{ lastWeight }} <span class="text-sm text-slate-400">kg</span>
    </UiStatCard>
    <UiStatCard label="Cambio total" :accent="deltaAccent">
      {{ progressDelta > 0 ? '+' : '' }}{{ progressDelta }} <span class="text-sm text-slate-400">kg</span>
    </UiStatCard>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{ maxWeight: number; lastWeight: number; progressDelta: number }>()
const deltaAccent = computed(() =>
  props.progressDelta > 0 ? 'text-lime' : props.progressDelta < 0 ? 'text-ember' : 'text-white',
)
</script>
