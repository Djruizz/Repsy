<template>
  <div v-if="day" class="space-y-6">
    <div class="flex items-center justify-between">
      <button class="px-3 py-2 text-xs btn-ghost" @click="navigateTo('/')">
        <AppIcon name="arrow-left" class="w-4 h-4" /> Semana
      </button>
      <div class="flex items-center gap-2">
        <button
          v-if="!isEdit"
          class="px-3 py-2 text-xs btn-ghost"
          @click="enterEdit"
        >
          <AppIcon name="edit" class="w-4 h-4" /> Editar
        </button>
        <button v-else class="px-3 py-2 text-xs btn-ghost" @click="exitEdit">
          <AppIcon name="check" class="w-4 h-4" :stroke-width="3" /> Hecho
        </button>
        <button
          v-if="day.items.length && !isEdit && !alreadyRunToday && isTodayDay"
          class="btn-primary"
          @click="navigateTo(`/correr/${day.id}`)"
        >
          <AppIcon name="play" class="w-4 h-4" />
          {{ activeSession ? "Reanudar" : "Correr" }}
        </button>
        <span
          v-else-if="day.items.length && !isEdit && alreadyRunToday"
          class="chip bg-lime/15 text-lime"
          title="Ya completaste esta rutina hoy"
        >
          <AppIcon name="check" class="h-3.5 w-3.5" :stroke-width="3" />
          Completada hoy
        </span>
        <!-- <span
          v-else-if="day.items.length && !isEdit && !isTodayDay"
          class="chip bg-white/5 text-slate-500"
          title="Solo puedes correr la rutina del día de hoy"
        >
          <AppIcon name="calendar" class="h-3.5 w-3.5" />
          no disponible
        </span> -->
      </div>
    </div>

    <!-- VIEW MODE -->
    <template v-if="!isEdit">
      <section class="p-5 surface">
        <div class="flex items-center gap-2">
          <span
            class="text-xs font-semibold tracking-wider uppercase text-slate-400"
            >{{ day.dayName }}</span
          >
          <span v-if="!day.enabled" class="chip bg-white/5 text-slate-500"
            >Inactivo</span
          >
        </div>
        <h1 class="mt-2 text-2xl font-bold tracking-tight text-white">
          {{ day.routineName || "Día libre" }}
        </h1>
        <p v-if="day.description" class="mt-2 text-sm text-slate-400">
          {{ day.description }}
        </p>
        <p v-else class="mt-2 text-sm text-slate-600">Sin descripción</p>
      </section>

      <section v-if="day.warmup" class="p-5 surface">
        <div class="flex items-center gap-2">
          <AppIcon name="sparkles" class="w-4 h-4 text-lime" />
          <h2 class="text-sm font-bold tracking-wider text-white uppercase">
            Calentamiento
          </h2>
        </div>
        <p
          class="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-slate-300"
        >
          {{ day.warmup }}
        </p>
      </section>

      <section class="space-y-3">
        <h2 class="text-sm font-bold tracking-wider text-white uppercase">
          Rutina <span class="text-slate-500">· {{ day.items.length }}</span>
        </h2>

        <div class="space-y-2.5">
          <div
            v-for="(item, idx) in day.items"
            :key="item.id"
            class="p-4 surface-raised"
          >
            <div class="flex items-start gap-3">
              <span
                class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/5 font-mono text-xs font-bold text-slate-400"
                >{{ idx + 1 }}</span
              >
              <div class="flex-1 min-w-0">
                <template v-if="item.type === 'exercise'">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-base font-semibold text-white truncate">
                      {{ item.name }}
                    </h3>
                    <MuscleBadge :group="item.muscle_group" />
                    <span
                      class="chip bg-white/5 text-slate-400"
                      :title="
                        item.score_by === 'time'
                          ? 'Por tiempo'
                          : 'Por repeticiones'
                      "
                    >
                      <AppIcon
                        :name="item.score_by === 'time' ? 'timer' : 'dumbbell'"
                        class="h-3.5 w-3.5"
                      />
                      {{ item.score_by === "time" ? "Tiempo" : "Reps" }}
                    </span>
                  </div>
                  <div
                    class="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400"
                  >
                    <span class="inline-flex items-center gap-1.5"
                      ><b class="font-mono text-slate-200">{{ item.sets }}</b>
                      series</span
                    >
                    <span
                      v-if="item.score_by === 'reps'"
                      class="inline-flex items-center gap-1.5"
                      ><b class="font-mono text-slate-200">{{
                        item.reps_range
                      }}</b>
                      reps</span
                    >
                    <span v-else class="inline-flex items-center gap-1.5"
                      ><b class="font-mono text-slate-200">{{
                        formatDuration(item.time)
                      }}</b>
                      por serie</span
                    >
                    <span class="inline-flex items-center gap-1.5"
                      >RPE
                      <b class="font-mono text-lime">{{ item.rpe }}</b></span
                    >
                    <span
                      v-if="item.rest_between_sets"
                      class="inline-flex items-center gap-1.5"
                      ><AppIcon name="rest" class="h-3.5 w-3.5 text-sky-400" />
                      {{ formatDuration(item.rest_between_sets) }}</span
                    >
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-center gap-2">
                    <AppIcon name="rest" class="w-4 h-4 text-sky-400" />
                    <h3 class="text-base font-semibold text-white">
                      {{ item.label }}
                    </h3>
                  </div>
                  <p class="mt-2 text-xs text-slate-400">
                    Duración:
                    <b class="font-mono text-sky-300">{{
                      formatDuration(item.duration)
                    }}</b>
                  </p>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="!day.items.length"
          class="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center surface"
        >
          <AppIcon name="dumbbell" class="w-8 h-8 text-slate-600" />
          <p class="text-sm text-slate-400">
            Aún no hay ejercicios en este día.
          </p>
          <button class="btn-ghost" @click="enterEdit">
            <AppIcon name="plus" class="w-4 h-4" /> Añadir ejercicios
          </button>
        </div>
      </section>
    </template>

    <!-- EDIT MODE -->
    <template v-else>
      <section class="p-5 surface">
        <div class="flex items-center gap-3">
          <span
            class="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300"
            >{{ day.dayName }}</span
          >
          <label
            class="flex items-center gap-2 ml-auto text-xs cursor-pointer text-slate-400"
          >
            <span>Día activo</span>
            <span
              class="relative h-5 transition rounded-full w-9"
              :class="day.enabled ? 'bg-lime' : 'bg-white/10'"
              @click="day.enabled = !day.enabled"
            >
              <span
                class="absolute top-0.5 h-4 w-4 rounded-full bg-ink-950 transition-all"
                :class="day.enabled ? 'left-[1.125rem]' : 'left-0.5'"
              />
            </span>
          </label>
        </div>

        <input
          v-model="day.routineName"
          class="w-full mt-3 text-2xl font-bold tracking-tight text-white bg-transparent outline-none placeholder:text-slate-600"
          placeholder="Nombre de la rutina"
        />
        <textarea
          v-model="day.description"
          rows="2"
          class="w-full mt-2 text-sm bg-transparent outline-none resize-none text-slate-400 placeholder:text-slate-600"
          placeholder="Descripción corta del día…"
        />
      </section>

      <section class="p-5 surface">
        <div class="flex items-center gap-2">
          <AppIcon name="sparkles" class="w-4 h-4 text-lime" />
          <h2 class="text-sm font-bold tracking-wider text-white uppercase">
            Calentamiento
          </h2>
        </div>
        <textarea
          v-model="day.warmup"
          rows="3"
          class="w-full p-3 mt-3 text-sm transition border outline-none resize-none rounded-xl border-white/5 bg-ink-900/60 text-slate-300 focus:border-lime/40"
          placeholder="Escribe un párrafo con los ejercicios de calentamiento (no se cuenta como ejercicio)…"
        />
      </section>

      <section class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold tracking-wider text-white uppercase">
            Rutina <span class="text-slate-500">· {{ day.items.length }}</span>
          </h2>
        </div>

        <TransitionGroup name="list" tag="div" class="space-y-2.5">
          <div
            v-for="(item, idx) in day.items"
            :key="item.id"
            class="p-4 surface-raised group"
          >
            <div class="flex items-start gap-3">
              <span
                class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/5 font-mono text-xs font-bold text-slate-400"
                >{{ idx + 1 }}</span
              >

              <div class="flex-1 min-w-0">
                <template v-if="item.type === 'exercise'">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-base font-semibold text-white truncate">
                      {{ item.name }}
                    </h3>
                    <MuscleBadge :group="item.muscle_group" />
                    <span
                      class="chip bg-white/5 text-slate-400"
                      :title="
                        item.score_by === 'time'
                          ? 'Por tiempo'
                          : 'Por repeticiones'
                      "
                    >
                      <AppIcon
                        :name="item.score_by === 'time' ? 'timer' : 'dumbbell'"
                        class="h-3.5 w-3.5"
                      />
                      {{ item.score_by === "time" ? "Tiempo" : "Reps" }}
                    </span>
                  </div>
                  <div
                    class="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400"
                  >
                    <span class="inline-flex items-center gap-1.5"
                      ><b class="font-mono text-slate-200">{{ item.sets }}</b>
                      series</span
                    >
                    <span
                      v-if="item.score_by === 'reps'"
                      class="inline-flex items-center gap-1.5"
                      ><b class="font-mono text-slate-200">{{
                        item.reps_range
                      }}</b>
                      reps</span
                    >
                    <span v-else class="inline-flex items-center gap-1.5"
                      ><b class="font-mono text-slate-200">{{
                        formatDuration(item.time)
                      }}</b>
                      por serie</span
                    >
                    <span class="inline-flex items-center gap-1.5"
                      >RPE
                      <b class="font-mono text-lime">{{ item.rpe }}</b></span
                    >
                    <span
                      v-if="item.rest_between_sets"
                      class="inline-flex items-center gap-1.5"
                      ><AppIcon name="rest" class="h-3.5 w-3.5 text-sky-400" />
                      {{ formatDuration(item.rest_between_sets) }}</span
                    >
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-center gap-2">
                    <AppIcon name="rest" class="w-4 h-4 text-sky-400" />
                    <h3 class="text-base font-semibold text-white">
                      {{ item.label }}
                    </h3>
                  </div>
                  <p class="mt-2 text-xs text-slate-400">
                    Duración objetivo:
                    <b class="font-mono text-sky-300">{{
                      formatDuration(item.duration)
                    }}</b>
                  </p>
                </template>
              </div>

              <div class="flex items-center gap-1 shrink-0">
                <button
                  class="grid transition rounded-md h-7 w-7 place-items-center text-slate-500 hover:bg-white/5 hover:text-white disabled:opacity-30"
                  :disabled="idx === 0"
                  @click="move(item.id, -1)"
                >
                  <AppIcon name="chevron-up" class="w-4 h-4" />
                </button>
                <button
                  class="grid transition rounded-md h-7 w-7 place-items-center text-slate-500 hover:bg-white/5 hover:text-white disabled:opacity-30"
                  :disabled="idx === day.items.length - 1"
                  @click="move(item.id, 1)"
                >
                  <AppIcon name="chevron-down" class="w-4 h-4" />
                </button>
                <button
                  class="grid transition rounded-md h-7 w-7 place-items-center text-slate-500 hover:bg-white/5 hover:text-lime"
                  @click="openEditItem(item)"
                >
                  <AppIcon name="edit" class="w-4 h-4" />
                </button>
                <button
                  class="grid transition rounded-md h-7 w-7 place-items-center text-slate-500 hover:bg-ember/10 hover:text-ember"
                  @click="removeItem(item.id)"
                >
                  <AppIcon name="trash" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <div
          v-if="!day.items.length"
          class="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center surface"
        >
          <AppIcon name="dumbbell" class="w-8 h-8 text-slate-600" />
          <p class="text-sm text-slate-400">
            Aún no hay ejercicios en este día.
          </p>
          <p class="text-xs text-slate-500">
            Añade ejercicios o descansos para empezar.
          </p>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row">
          <button class="flex-1 btn-ghost" @click="openAdd('exercise')">
            <AppIcon name="plus" class="w-4 h-4" /> Añadir ejercicio
          </button>
          <button class="flex-1 btn-ghost" @click="openAdd('rest')">
            <AppIcon name="clock" class="w-4 h-4" /> Añadir descanso
          </button>
        </div>
      </section>
    </template>
  </div>

  <div v-else class="grid py-24 text-center place-items-center">
    <div>
      <p class="text-sm text-slate-400">No se encontró este día.</p>
      <button class="mt-4 btn-ghost" @click="navigateTo('/')">
        Volver a la semana
      </button>
    </div>
  </div>

  <BaseModal
    v-if="modal"
    :open="true"
    :title="modalTitle"
    @close="modal = null"
  >
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
import { formatDuration } from "~/composables/useTimer";
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

const todayKey = todayLocalKey();
const alreadyRunToday = computed(() =>
  sessions.value.some(
    (s) =>
      s.dayId === day.value?.id &&
      s.completed &&
      localDayKey(s.date) === todayKey,
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
  if (modal.value?.mode === "add") addItem(day.value!.id, ex);
  else updateItem(day.value!.id, ex.id, ex);
  modal.value = null;
}
function saveRest(r: Rest) {
  if (modal.value?.mode === "add") addItem(day.value!.id, r);
  else updateItem(day.value!.id, r.id, r);
  modal.value = null;
}
function removeItem(id: string) {
  deleteItem(day.value!.id, id);
}
function move(id: string, dir: -1 | 1) {
  moveItem(day.value!.id, id, dir);
}
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.list-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
.list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
