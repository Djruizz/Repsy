<template>
  <section class="grid grid-cols-3 gap-3">
    <UiStatCard label="Racha actual" accent="text-lime">{{ streak }}</UiStatCard>
    <UiStatCard label="Sesiones totales">{{ total }}</UiStatCard>
    <UiStatCard label="Este mes">{{ thisMonth }}</UiStatCard>
  </section>
</template>

<script setup lang="ts">
defineProps<{ streak: number; total: number; thisMonth: number }>()
</script>
