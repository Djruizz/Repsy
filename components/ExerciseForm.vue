<template>
  <form class="space-y-4" @submit.prevent="$emit('save', draft)">
    <div>
      <label class="label">Nombre del ejercicio</label>
      <input v-model="draft.name" class="input mt-1.5" placeholder="Ej. Press de banca" autofocus />
    </div>

    <div>
      <label class="label">Grupo muscular</label>
      <div class="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
        <button
          v-for="m in MUSCLE_GROUPS" :key="m.id" type="button"
          class="rounded-lg border px-2 py-2 text-xs font-medium transition"
          :class="draft.muscle_group === m.id ? 'text-white' : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200'"
          :style="draft.muscle_group === m.id ? { borderColor: m.color + '66', background: m.color + '1f', color: m.color } : undefined"
          @click="draft.muscle_group = m.id"
        >
          {{ m.label }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="label">Series</label>
        <input v-model.number="draft.sets" type="number" min="1" max="20" class="input mt-1.5" />
      </div>
      <div>
        <label class="label">Rango de reps</label>
        <input v-model="draft.reps_range" class="input mt-1.5" placeholder="8-12" />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="label">RPE</label>
        <div class="mt-1.5 flex items-center gap-2">
          <input v-model.number="draft.rpe" type="range" min="1" max="10" step="1" class="flex-1 accent-lime" />
          <span class="w-8 text-center font-mono text-sm font-bold text-lime">{{ draft.rpe }}</span>
        </div>
      </div>
      <div>
        <label class="label">Tiempo (seg)</label>
        <input v-model.number="draft.time" type="number" min="0" class="input mt-1.5" placeholder="0" />
      </div>
    </div>

    <div>
      <label class="label">Descanso entre series (seg)</label>
      <div class="mt-1.5 flex items-center gap-2">
        <input v-model.number="draft.rest_between_sets" type="number" min="0" class="input flex-1" placeholder="90" />
        <div class="flex gap-1.5">
          <button v-for="p in [60, 90, 120, 180]" :key="p" type="button"
            class="rounded-lg border px-2.5 py-2 text-xs font-medium transition"
            :class="draft.rest_between_sets === p ? 'border-lime/40 bg-lime/10 text-lime' : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200'"
            @click="draft.rest_between_sets = p"
          >{{ p }}s</button>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2 pt-1">
      <button type="button" class="btn-ghost" @click="$emit('cancel')">Cancelar</button>
      <button type="submit" class="btn-primary" :disabled="!draft.name.trim()">Guardar</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { MUSCLE_GROUPS, type Exercise } from '~/types'

const props = defineProps<{ modelValue: Exercise }>()
const emit = defineEmits<{ save: [Exercise]; cancel: [] }>()

const draft = reactive({ ...props.modelValue })
watch(() => props.modelValue, (v) => Object.assign(draft, v))
</script>
