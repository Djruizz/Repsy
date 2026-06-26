<template>
  <div class="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
    <div
      class="h-full transition-all duration-300 rounded-full bg-lime"
      :style="{ width: progress + '%' }"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{ progress: number }>()
</script>
