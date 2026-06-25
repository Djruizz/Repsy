<template>
  <form class="space-y-4" @submit.prevent="$emit('save', draft)">
    <div>
      <label class="label">Etiqueta del descanso</label>
      <input v-model="draft.label" class="input mt-1.5" placeholder="Ej. Descanso entre series" autofocus />
    </div>

    <div>
      <label class="label">Duración</label>
      <div class="mt-2 flex items-center gap-3">
        <div class="flex flex-1 gap-1.5">
          <button v-for="p in presets" :key="p" type="button"
            class="rounded-lg border px-3 py-2 text-sm font-medium transition"
            :class="draft.duration === p ? 'border-lime/40 bg-lime/10 text-lime' : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200'"
            @click="draft.duration = p"
          >{{ p }}s</button>
        </div>
      </div>
      <input v-model.number="draft.duration" type="number" min="1" class="input mt-2" placeholder="Segundos" />
      <p class="mt-2 text-xs text-slate-500">{{ formatDuration(draft.duration) }}</p>
    </div>

    <div class="flex justify-end gap-2 pt-1">
      <button type="button" class="btn-ghost" @click="$emit('cancel')">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="!draft.duration">Guardar</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { formatDuration } from '~/composables/useTimer'
import type { Rest } from '~/types'

const props = defineProps<{ modelValue: Rest }>()
const emit = defineEmits<{ save: [Rest]; cancel: [] }>()

const draft = reactive({ ...props.modelValue })
watch(() => props.modelValue, (v) => Object.assign(draft, v))
const presets = [45, 60, 90, 120, 180]
</script>
