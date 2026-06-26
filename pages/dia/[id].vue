<template>
  <div v-if="day" class="space-y-6">
    <DayHeader
      :is-edit="isEdit"
      :has-items="day.items.length > 0"
      :already-run-today="alreadyRunToday"
      :is-today-day="isTodayDay"
      :has-active-session="!!activeSession"
      @back="navigateTo('/')"
      @edit="enterEdit"
      @done="exitEdit"
      @run="navigateTo(`/correr/${day.id}`)"
    />

    <!-- VIEW MODE -->
    <template v-if="!isEdit">
      <DaySummary :day="day" />
      <DayWarmup :model-value="day.warmup" />
      <DayRoutineList :items="day.items" @add="enterEdit" />
    </template>

    <!-- EDIT MODE -->
    <template v-else>
      <DayEditSummary :day="day" />
      <DayWarmup v-model="day.warmup" editable />
      <DayEditRoutine
        :items="day.items"
        @move="move"
        @edit="openEditItem"
        @remove="removeItem"
        @add-exercise="openAdd('exercise')"
        @add-rest="openAdd('rest')"
      />
    </template>
  </div>

  <DayNotFoundState v-else @back="navigateTo('/')" />

  <BaseModal v-if="modal" :open="true" :title="modalTitle" @close="modal = null">
    <ExerciseForm
      v-if="modal.type === 'exercise'"
      :model-value="modal.item as Exercise"
      @save="saveExercise"
      @cancel="modal = null"
    />
    <RestForm
      v-else
      :model-value="modal.item as Rest"
      @save="saveRest"
      @cancel="modal = null"
    />
  </BaseModal>
</template>

<script setup lang="ts">
import { type Exercise, type Rest, type RoutineItem } from "~/types";
import {
  weekdayName,
  localDayKey,
  todayKey as todayLocalKey,
} from "~/composables/useCalendar";

const route = useRoute();
const router = useRouter();
const {
  getDay,
  addItem,
  updateItem,
  removeItem: deleteItem,
  moveItem,
  newExercise,
  newRest,
  sessions,
  getActiveSession,
} = useGymData();

const day = computed(() => getDay(String(route.params.id)));
const isEdit = computed(() => route.query.edit !== undefined);

const todayKey = computed(() => todayLocalKey());
const alreadyRunToday = computed(() =>
  sessions.value.some(
    (s) =>
      s.dayId === day.value?.id &&
      s.completed &&
      localDayKey(s.date) === todayKey.value,
  ),
);
const activeSession = computed(() =>
  day.value ? getActiveSession(day.value.id) : undefined,
);
const isTodayDay = computed(
  () => day.value?.dayName === weekdayName(new Date()),
);

function enterEdit() {
  router.push({ path: route.path, query: { edit: "" } });
}
function exitEdit() {
  router.push({ path: route.path });
}

interface ModalState {
  type: "exercise" | "rest";
  mode: "add" | "edit";
  item: Exercise | Rest;
}
const modal = ref<ModalState | null>(null);
const modalTitle = computed(() => {
  if (!modal.value) return "";
  const verb = modal.value.mode === "add" ? "Añadir" : "Editar";
  return `${verb} ${modal.value.type === "exercise" ? "ejercicio" : "descanso"}`;
});

function openAdd(type: "exercise" | "rest") {
  modal.value = {
    type,
    mode: "add",
    item: type === "exercise" ? newExercise() : newRest(),
  };
}
function openEditItem(item: RoutineItem) {
  modal.value = { type: item.type, mode: "edit", item: { ...item } };
}

function saveExercise(ex: Exercise) {
  const clamped: Exercise = {
    ...ex,
    sets: Math.max(1, Math.round(ex.sets || 1)),
    rpe: Math.max(1, Math.min(10, Math.round(ex.rpe || 7))),
    time: Math.max(0, Math.round(ex.time || 0)),
    rest_between_sets: Math.max(0, Math.round(ex.rest_between_sets || 0)),
  }
  if (modal.value?.mode === "add") addItem(day.value!.id, clamped);
  else updateItem(day.value!.id, clamped.id, clamped);
  modal.value = null;
}
function saveRest(r: Rest) {
  const clamped: Rest = {
    ...r,
    duration: Math.max(1, Math.round(r.duration || 90)),
  }
  if (modal.value?.mode === "add") addItem(day.value!.id, clamped);
  else updateItem(day.value!.id, clamped.id, clamped);
  modal.value = null;
}
function removeItem(id: string) {
  deleteItem(day.value!.id, id);
}
function move(id: string, dir: -1 | 1) {
  moveItem(day.value!.id, id, dir);
}
</script>
