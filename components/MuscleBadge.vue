<template>
  <span
    class="chip border"
    :style="{ color: meta.color, borderColor: meta.color + '33', background: meta.color + '14' }"
  >
    <span class="h-1.5 w-1.5 rounded-full" :style="{ background: meta.color }" />
    {{ meta.label }}
  </span>
</template>

<script setup lang="ts">
import { muscleMeta, type MuscleGroup } from '~/types'
const props = defineProps<{ group: MuscleGroup }>()
const meta = computed(() => muscleMeta(props.group))
</script>
