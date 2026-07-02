<template>
  <form class="space-y-4" @submit.prevent="$emit('save', draft)">
    <div>
      <label class="label">Nombre del ejercicio</label>
      <div ref="searchRoot" class="relative mt-1.5">
        <div class="flex items-center gap-2">
          <input
            v-model="draft.name"
            type="text"
            class="flex-1 input"
            placeholder="Press de banca"
            @focus="showDropdown = true"
            @input="showDropdown = true"
          />
          <MuscleBadge :group="draft.muscle_group" class="hidden sm:flex" />
        </div>
        <div
          v-if="showDropdown && searchMatches.length"
          class="absolute left-0 right-0 z-30 mt-1 overflow-y-auto border shadow-xl top-full max-h-56 rounded-xl border-white/10 bg-ink-800"
        >
          <button
            v-for="ex in searchMatches"
            :key="ex.id"
            type="button"
            class="flex items-center w-full gap-2 px-3 py-2 text-sm text-left transition hover:bg-ink-700"
            :class="
              draft.name === ex.name ? 'bg-ink-700 text-lime' : 'text-slate-300'
            "
            @mousedown.prevent="selectExercise(ex)"
          >
            <span class="flex-1 truncate">{{ ex.name }}</span>
            <MuscleBadge :group="ex.muscleGroup" class="hidden sm:flex" />
            <span class="hidden text-xs text-slate-500 sm:inline shrink-0">{{
              ex.equipment
            }}</span>
          </button>
        </div>
      </div>
    </div>

    <div ref="groupRoot" class="relative">
      <label class="label">Grupo muscular</label>
      <button
        type="button"
        class="mt-1.5 flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-ink-850 px-3 py-2.5 text-sm text-slate-200 transition hover:border-white/20"
        @click="showGroupDropdown = !showGroupDropdown"
      >
        <MuscleBadge :group="draft.muscle_group" />
        <AppIcon
          name="chevron-down"
          class="w-4 h-4 transition text-slate-500"
          :class="showGroupDropdown ? 'rotate-180' : ''"
        />
      </button>
      <div
        v-if="showGroupDropdown"
        class="absolute left-0 right-0 z-30 mt-1 overflow-y-auto border shadow-xl max-h-56 rounded-xl border-white/10 bg-ink-800"
      >
        <button
          v-for="m in MUSCLE_GROUPS"
          :key="m.id"
          type="button"
          class="flex items-center w-full gap-2 px-3 py-2 text-sm text-left transition hover:bg-ink-700"
          :class="
            draft.muscle_group === m.id
              ? 'bg-ink-700 text-white'
              : 'text-slate-300'
          "
          @click="
            draft.muscle_group = m.id;
            showGroupDropdown = false;
          "
        >
          <span
            class="w-2 h-2 rounded-full shrink-0"
            :style="{ background: m.color }"
          />
          {{ m.label }}
        </button>
      </div>
    </div>

    <div>
      <label class="label">Tipo de serie</label>
      <div class="mt-2 grid grid-cols-2 gap-1.5">
        <button
          v-for="opt in scoreOptions"
          :key="opt.value"
          type="button"
          class="flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition"
          :class="
            draft.score_by === opt.value
              ? 'border-lime/40 bg-lime/10 text-lime'
              : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200'
          "
          @click="draft.score_by = opt.value"
        >
          <AppIcon :name="opt.icon" class="w-4 h-4" />
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="label">Series</label>
        <input
          v-model.number="draft.sets"
          type="number"
          min="1"
          max="20"
          class="input mt-1.5"
        />
      </div>
      <div v-if="draft.score_by === 'reps'">
        <label class="label">Rango de reps</label>
        <input
          v-model="draft.reps_range"
          class="input mt-1.5"
          placeholder="8-12"
        />
      </div>
      <div v-else>
        <label class="label">Tiempo por serie (seg)</label>
        <input
          v-model.number="draft.time"
          type="number"
          min="1"
          class="input mt-1.5"
          placeholder="45"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="label">RPE</label>
        <div class="mt-1.5 flex items-center gap-2">
          <input
            v-model.number="draft.rpe"
            type="range"
            min="1"
            max="10"
            step="1"
            class="flex-1 accent-lime"
          />
          <span class="w-8 font-mono text-sm font-bold text-center text-lime">{{
            draft.rpe
          }}</span>
        </div>
      </div>
      <div v-if="draft.score_by === 'reps'">
        <label class="label">Tiempo extra (seg)</label>
        <input
          v-model.number="draft.time"
          type="number"
          min="0"
          class="input mt-1.5"
          placeholder="0"
        />
      </div>
    </div>

    <div>
      <label class="label">Descanso entre series (seg)</label>
      <div class="mt-1.5 flex items-center gap-2">
        <input
          v-model.number="draft.rest_between_sets"
          type="number"
          min="0"
          class="flex-1 input"
          placeholder="90"
        />
        <div class="flex gap-1.5">
          <button
            v-for="p in [60, 90, 120, 180]"
            :key="p"
            type="button"
            class="rounded-lg border px-2.5 py-2 text-xs font-medium transition"
            :class="
              draft.rest_between_sets === p
                ? 'border-lime/40 bg-lime/10 text-lime'
                : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200'
            "
            @click="draft.rest_between_sets = p"
          >
            {{ p }}s
          </button>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2 pt-1">
      <button type="button" class="btn-ghost" @click="$emit('cancel')">
        Cancelar
      </button>
      <button
        type="submit"
        class="btn-primary"
        :disabled="
          !draft.name.trim() ||
          draft.sets < 1 ||
          draft.time < 0 ||
          draft.rest_between_sets < 0
        "
      >
        Guardar
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import {
  onBeforeUnmount,
  onMounted,
  ref,
  reactive,
  watch,
  computed,
} from "vue";
import { MUSCLE_GROUPS, type Exercise, type ScoreBy } from "~/types";
import {
  useExerciseCatalog,
  type CatalogExercise,
} from "~/composables/useExerciseCatalog";

const props = defineProps<{ modelValue: Exercise }>();
const emit = defineEmits<{ save: [Exercise]; cancel: [] }>();

const { search } = useExerciseCatalog();

const draft = reactive({ ...props.modelValue });
watch(
  () => props.modelValue,
  (v) => Object.assign(draft, v),
);

const showDropdown = ref(false);
const showGroupDropdown = ref(false);
const searchRoot = ref<HTMLElement | null>(null);
const groupRoot = ref<HTMLElement | null>(null);

const searchMatches = computed(() => {
  if (!draft.name.trim()) return [];
  return search(draft.name);
});

function selectExercise(ex: CatalogExercise) {
  draft.name = ex.name;
  draft.muscle_group = ex.muscleGroup;
}

function onDocClick(e: MouseEvent) {
  if (
    showDropdown.value &&
    searchRoot.value &&
    !searchRoot.value.contains(e.target as Node)
  ) {
    showDropdown.value = false;
  }
  if (
    showGroupDropdown.value &&
    groupRoot.value &&
    !groupRoot.value.contains(e.target as Node)
  ) {
    showGroupDropdown.value = false;
  }
}

onMounted(() => document.addEventListener("click", onDocClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocClick));

const scoreOptions: { value: ScoreBy; label: string; icon: string }[] = [
  { value: "reps", label: "Repeticiones", icon: "dumbbell" },
  { value: "time", label: "Tiempo", icon: "timer" },
];
</script>
