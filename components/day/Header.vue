<template>
  <div class="flex items-center justify-between">
    <button class="px-3 py-2 text-xs btn-ghost" @click="$emit('back')">
      <AppIcon name="arrow-left" class="w-4 h-4" /> Semana
    </button>
    <div class="flex items-center gap-2">
      <button v-if="!isEdit" class="px-3 py-2 text-xs btn-ghost" @click="$emit('edit')">
        <AppIcon name="edit" class="w-4 h-4" /> Editar
      </button>
      <button v-else class="px-3 py-2 text-xs btn-ghost" @click="$emit('done')">
        <AppIcon name="check" class="w-4 h-4" :stroke-width="3" /> Hecho
      </button>
      <button
        v-if="hasItems && !isEdit && !alreadyRunToday && isTodayDay"
        class="btn-primary"
        @click="$emit('run')"
      >
        <AppIcon name="play" class="w-4 h-4" />
        {{ hasActiveSession ? 'Reanudar' : 'Correr' }}
      </button>
      <span
        v-else-if="hasItems && !isEdit && alreadyRunToday"
        class="chip bg-lime/15 text-lime"
        title="Ya completaste esta rutina hoy"
      >
        <AppIcon name="check" class="h-3.5 w-3.5" :stroke-width="3" />
        Completada hoy
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  isEdit: boolean
  hasItems: boolean
  alreadyRunToday: boolean
  isTodayDay: boolean
  hasActiveSession?: boolean
}>(), { hasActiveSession: false })

defineEmits<{ back: []; edit: []; done: []; run: [] }>()
</script>
