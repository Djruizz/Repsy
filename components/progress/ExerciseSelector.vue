<template>
  <div class="space-y-3">
    <div
      class="sticky top-0 z-10 px-4 pt-1 pb-2 -mx-4 bg-ink-900/80 backdrop-blur"
    >
      <div class="flex gap-2">
        <div ref="root" class="relative">
          <button
            type="button"
            class="relative flex items-center justify-center w-10 h-10 btn-ghost"
            :class="open ? 'text-lime' : 'text-slate-300'"
            :aria-expanded="open"
            aria-haspopup="listbox"
            :aria-label="
              activeGroup
                ? `Filtrar por ${activeMeta?.label}`
                : 'Filtrar por grupo muscular'
            "
            @click="open = !open"
          >
            <AppIcon name="menu" class="!h-5 !w-5" />
            <span
              class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-ink-900"
              :class="indicatorClass"
              :style="indicatorStyle"
            />
          </button>
          <div
            v-if="open"
            class="absolute left-0 z-20 w-56 p-1 overflow-y-auto border shadow-xl top-12 max-h-80 rounded-xl border-white/10 bg-ink-800"
            role="listbox"
          >
            <button
              type="button"
              role="option"
              :aria-selected="activeGroup === null"
              class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition hover:bg-ink-700"
              :class="activeGroup === null ? 'text-lime' : 'text-slate-300'"
              @click="selectGroup(null)"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-slate-500" />
              Todos
            </button>
            <button
              v-for="g in groups"
              :key="g.meta.id"
              type="button"
              role="option"
              :aria-selected="activeGroup === g.meta.id"
              class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition hover:bg-ink-700"
              :class="
                activeGroup === g.meta.id ? 'bg-slate-800' : 'text-slate-300'
              "
              @click="selectGroup(g.meta.id)"
            >
              <MuscleBadge :group="g.meta.id" />
            </button>
            <p v-if="!groups.length" class="px-2 py-1.5 text-xs text-slate-500">
              Sin coincidencias
            </p>
          </div>
        </div>
        <input
          v-model="query"
          type="text"
          class="flex-1 input"
          placeholder="Buscar ejercicio…"
        />
      </div>
    </div>

    <div
      v-if="activeItems.length"
      class="flex gap-1.5 overflow-x-auto no-scrollbar"
    >
      <button
        v-for="ex in activeItems"
        :key="ex.name"
        class="px-3 py-2 text-xs font-medium transition border shrink-0 rounded-xl"
        :class="
          modelValue === ex.name
            ? 'border-lime/40 bg-lime/10 text-lime'
            : 'border-white/5 bg-ink-850 text-slate-400 hover:text-slate-200'
        "
        @click="$emit('update:modelValue', ex.name)"
      >
        {{ ex.name }}
      </button>
    </div>
    <p v-else-if="exercises.length" class="text-xs text-slate-500">
      Sin coincidencias en este grupo
    </p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { MUSCLE_GROUPS, type MuscleGroup, type MuscleMeta } from "~/types";

interface Exercise {
  name: string;
  muscle_group: MuscleGroup;
}

const props = defineProps<{ exercises: Exercise[]; modelValue: string }>();
defineEmits<{ "update:modelValue": [string] }>();

const query = ref("");
const open = ref(false);
const activeGroup = ref<MuscleGroup | null>(null);
const root = ref<HTMLElement | null>(null);

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const filtered = computed(() => {
  const q = normalize(query.value.trim());
  if (!q) return props.exercises;
  return props.exercises.filter((e) => normalize(e.name).includes(q));
});

const groups = computed<{ meta: MuscleMeta; items: Exercise[] }[]>(() => {
  const buckets = new Map<MuscleGroup, Exercise[]>();
  for (const e of filtered.value) {
    const list = buckets.get(e.muscle_group);
    if (list) list.push(e);
    else buckets.set(e.muscle_group, [e]);
  }
  return MUSCLE_GROUPS.map((meta) => ({
    meta,
    items: buckets.get(meta.id) ?? [],
  })).filter((g) => g.items.length > 0);
});

const activeItems = computed(() => {
  if (activeGroup.value) {
    return (
      groups.value.find((g) => g.meta.id === activeGroup.value)?.items ?? []
    );
  }
  return filtered.value;
});

const activeMeta = computed<MuscleMeta | null>(() => {
  if (!activeGroup.value) return null;
  return MUSCLE_GROUPS.find((m) => m.id === activeGroup.value) ?? null;
});

const indicatorClass = computed(() => {
  const color = activeMeta.value?.color;
  return color ? "" : "bg-lime";
});

const indicatorStyle = computed(() => {
  const color = activeMeta.value?.color;
  return color ? { backgroundColor: color } : {};
});

function selectGroup(id: MuscleGroup | null) {
  activeGroup.value = id;
  open.value = false;
}

function onDocClick(e: MouseEvent) {
  if (!open.value) return;
  if (root.value && !root.value.contains(e.target as Node)) open.value = false;
}

onMounted(() => document.addEventListener("click", onDocClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocClick));
</script>
