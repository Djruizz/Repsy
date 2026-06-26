<template>
  <div class="relative grid place-items-center" :style="{ width: size + 'px', height: size + 'px' }">
    <svg class="absolute inset-0 -rotate-90" :viewBox="`0 0 ${size} ${size}`">
      <circle
        :cx="cx"
        :cy="cy"
        :r="radius"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        :stroke-width="strokeWidth"
      />
      <circle
        :cx="cx"
        :cy="cy"
        :r="radius"
        fill="none"
        :stroke="color"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="circumference * (1 - progress)"
        style="transition: stroke-dashoffset 0.1s linear"
      />
    </svg>
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: number
  radius?: number
  strokeWidth?: number
  color?: string
  progress: number
}>(), {
  size: 128,
  radius: 58,
  strokeWidth: 6,
  color: '#38bdf8',
})

const cx = computed(() => props.size / 2)
const cy = computed(() => props.size / 2)
const circumference = computed(() => 2 * Math.PI * props.radius)
</script>
