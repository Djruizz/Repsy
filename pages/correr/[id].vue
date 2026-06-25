<template>
  <div v-if="day" class="space-y-5">
    <div class="flex items-center justify-between">
      <button class="px-3 py-2 text-xs btn-ghost" @click="confirmLeave">
        <AppIcon name="arrow-left" class="w-4 h-4" /> Salir
      </button>
      <div class="text-center">
        <p class="text-xs tracking-wider uppercase text-slate-500">
          {{ day.dayName }}
        </p>
        <p class="text-sm font-bold text-white">
          {{ day.routineName || "Rutina" }}
        </p>
      </div>
      <button class="px-3 py-2 text-xs btn-primary" @click="finish">
        <AppIcon name="check" class="w-4 h-4" :stroke-width="3" /> Finalizar
      </button>
    </div>

    <div class="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
      <div
        class="h-full transition-all duration-300 rounded-full bg-lime"
        :style="{ width: progress + '%' }"
      />
    </div>

    <!-- INTER-SET REST TIMER OVERLAY -->
    <Transition name="slide-up">
      <section
        v-if="setRestActive && current?.type === 'exercise'"
        class="fixed inset-x-0 bottom-0 z-50 px-5 pt-5 pb-8 border-b-0 rounded-b-none surface-raised rounded-t-3xl sm:inset-x-4 sm:mx-auto sm:max-w-sm sm:rounded-t-3xl"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <AppIcon name="rest" class="w-5 h-5 text-sky-400" />
            <span class="text-sm font-bold text-white"
              >Descanso entre series</span
            >
          </div>
          <span class="text-xs text-slate-400"
            >Serie {{ setRestSetIdx + 1 }} → {{ setRestSetIdx + 2 }}</span
          >
        </div>

        <div class="flex items-center gap-4 mt-4">
          <div class="relative grid w-20 h-20 shrink-0 place-items-center">
            <svg
              class="absolute inset-0 w-20 h-20 -rotate-90"
              viewBox="0 0 80 80"
            >
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                stroke-width="4"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="#38bdf8"
                stroke-width="4"
                stroke-linecap="round"
                :stroke-dasharray="226.19"
                :stroke-dashoffset="226.19 * (1 - countdown.progress.value)"
                style="transition: stroke-dashoffset 0.1s linear"
              />
            </svg>
            <span class="font-mono text-xl font-bold text-white tabular-nums">{{
              formatTime(countdown.seconds.value)
            }}</span>
          </div>

          <div class="flex-1">
            <p
              v-if="countdown.finished.value"
              class="text-sm font-semibold text-lime"
            >
              ¡Descanso completado!
            </p>
            <p v-else class="text-sm text-slate-400">
              Próxima serie lista en {{ countdown.seconds.value }}s
            </p>
            <div class="flex gap-2 mt-3">
              <button
                v-if="countdown.running.value"
                class="flex-1 text-xs btn-ghost"
                @click="countdown.pause()"
              >
                <AppIcon name="pause" class="w-4 h-4" /> Pausar
              </button>
              <button
                v-else-if="!countdown.finished.value"
                class="flex-1 text-xs btn-ghost"
                @click="countdown.resume()"
              >
                <AppIcon name="play" class="w-4 h-4" /> Reanudar
              </button>
              <button class="flex-1 text-xs btn-primary" @click="endSetRest">
                <AppIcon name="skip" class="w-4 h-4" />
                {{ countdown.finished.value ? "Continuar" : "Saltar" }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </Transition>

    <section v-if="current" class="p-5 overflow-hidden surface-raised">
      <div class="flex items-center justify-between text-xs">
        <span class="font-mono text-slate-500"
          >{{ currentIdx + 1 }} / {{ day.items.length }}</span
        >
        <span class="chip bg-white/5 text-slate-300">{{
          current.type === "exercise" ? "Ejercicio" : "Descanso"
        }}</span>
      </div>

      <!-- EXERCISE -->
      <div v-if="current.type === 'exercise'" class="mt-4 animate-fade-up">
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="text-xl font-bold text-white">{{ current.name }}</h2>
          <MuscleBadge :group="current.muscle_group" />
        </div>
        <p class="mt-1.5 text-sm text-slate-400">
          {{ current.sets }} series · {{ current.reps_range }} reps · RPE
          {{ current.rpe }}
          <span v-if="current.time"> · {{ formatDuration(current.time) }}</span>
          <span v-if="current.rest_between_sets">
            · descanso {{ formatDuration(current.rest_between_sets) }}</span
          >
        </p>

        <p class="mt-5 label">Series · completa en orden</p>
        <div class="mt-2.5 flex flex-wrap gap-2.5">
          <button
            v-for="i in current.sets"
            :key="i"
            class="relative grid text-lg font-bold transition border-2 h-14 w-14 place-items-center rounded-2xl active:scale-95"
            :class="setClass(current, i - 1)"
            :disabled="!canClickSet(current, i - 1)"
            @click="cycleSet(current, i - 1)"
          >
            {{ i }}
            <AppIcon
              v-if="setState(current, i - 1) === 'done'"
              name="check"
              class="absolute bottom-1 h-3.5 w-3.5"
              :stroke-width="3"
            />
            <span
              v-if="setState(current, i - 1) === 'skipped'"
              class="absolute bottom-1.5 h-0.5 w-5 rounded bg-current"
            />
          </button>
        </div>

        <!-- Weight input for the active set -->
        <div v-if="activeSetIdxNum >= 0 && !setRestActive" class="mt-4 flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900/60 p-3">
          <div class="flex flex-col">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Serie {{ activeSetIdxNum + 1 }} · peso</span>
            <div class="mt-1 flex items-baseline gap-1">
              <input
                :value="currentWeight"
                type="number"
                inputmode="decimal"
                min="0"
                step="0.5"
                class="w-20 bg-transparent text-2xl font-bold text-white outline-none placeholder:text-slate-600"
                placeholder="0"
                @input="currentWeight = parseFloat(($event.target as HTMLInputElement).value) || 0"
                @keydown.enter="completeSetWithWeight(current, activeSetIdxNum)"
              />
              <span class="text-sm font-medium text-slate-400">kg</span>
            </div>
          </div>
          <button
            class="btn-primary ml-auto px-4 py-2.5 text-sm"
            @click="completeSetWithWeight(current, activeSetIdxNum)"
          >
            <AppIcon name="check" class="w-4 h-4" :stroke-width="3" /> Completar serie
          </button>
        </div>

        <!-- Show recorded weights for completed sets -->
        <div v-if="hasRecordedWeights(current)" class="mt-3 flex flex-wrap gap-2 text-xs">
          <span
            v-for="i in current.sets" :key="i"
            v-show="getSetWeight(current, i - 1) != null"
            class="chip bg-white/5 text-slate-300"
          >
            S{{ i }}: <b class="font-mono text-slate-200">{{ getSetWeight(current, i - 1) }}</b> kg
          </span>
        </div>

        <div class="flex gap-2 mt-5">
          <button class="flex-1 btn-ghost" @click="skipExercise(current)">
            <AppIcon name="skip" class="w-4 h-4" /> Saltar ejercicio
          </button>
        </div>
      </div>

      <!-- REST ITEM -->
      <div v-else class="mt-4 animate-fade-up">
        <div class="flex items-center gap-2">
          <AppIcon name="rest" class="w-5 h-5 text-sky-400" />
          <h2 class="text-xl font-bold text-white">{{ current.label }}</h2>
        </div>
        <p class="mt-1.5 text-sm text-slate-400">
          Descanso objetivo: {{ formatDuration(current.duration) }}
        </p>

        <div class="flex flex-col items-center mt-5">
          <div class="relative grid place-items-center">
            <span
              v-if="stopwatch.running.value"
              class="absolute w-32 h-32 border-2 rounded-full border-sky-400/40 animate-pulse-ring"
            />
            <div
              class="grid w-32 h-32 border-2 rounded-full place-items-center border-white/10 bg-ink-900"
            >
              <span
                class="font-mono text-3xl font-bold text-white tabular-nums"
              >
                {{ formatTime(displaySeconds)
                }}<span class="text-lg text-slate-500"
                  >.{{ displayTenths }}</span
                >
              </span>
            </div>
          </div>
          <p class="mt-4 text-xs text-slate-400">
            Ciclo
            <b class="font-mono text-sky-300">{{
              (session?.restCycle[current.id] || 0) + 1
            }}</b>
            de <b class="font-mono text-sky-300">{{ restCycles(current) }}</b>
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2 mt-5">
          <button
            v-if="!stopwatch.running.value && !stopwatch.paused.value"
            class="col-span-2 btn-primary"
            @click="beginRest()"
          >
            <AppIcon name="play" class="w-4 h-4" /> Iniciar descanso
          </button>
          <template v-else>
            <button
              v-if="stopwatch.running.value"
              class="btn-ghost"
              @click="pauseRest(current)"
            >
              <AppIcon name="pause" class="w-4 h-4" /> Pausar
            </button>
            <button v-else class="btn-ghost" @click="resumeRest">
              <AppIcon name="play" class="w-4 h-4" /> Reanudar
            </button>
            <button class="btn-primary" @click="nextCycle(current)">
              <AppIcon name="skip" class="w-4 h-4" /> Siguiente
            </button>
            <button class="col-span-2 btn-danger" @click="skipRest(current)">
              <AppIcon name="stop" class="w-4 h-4" /> Saltar descanso
            </button>
          </template>
        </div>
      </div>
    </section>

    <section
      v-else
      class="flex flex-col items-center gap-3 px-4 py-12 text-center surface"
    >
      <AppIcon name="check" class="w-10 h-10 text-lime" :stroke-width="3" />
      <h2 class="text-lg font-bold text-white">¡Rutina completada!</h2>
      <p class="text-sm text-slate-400">
        Has terminado todos los ejercicios del día.
      </p>
      <button class="mt-1 btn-primary" @click="finish">
        <AppIcon name="check" class="w-4 h-4" :stroke-width="3" /> Finalizar
        sesión
      </button>
    </section>

    <section>
      <p class="mb-2 label">Progreso</p>
      <div class="space-y-1.5">
        <div
          v-for="(item, idx) in day.items"
          :key="item.id"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition"
          :class="idx === currentIdx ? 'bg-lime/10' : 'bg-white/[0.02]'"
        >
          <span
            class="grid w-6 h-6 text-xs rounded-md place-items-center"
            :class="itemDotClass(item)"
          >
            <AppIcon
              v-if="isItemDone(item)"
              name="check"
              class="h-3.5 w-3.5"
              :stroke-width="3"
            />
            <span v-else class="font-mono">{{ idx + 1 }}</span>
          </span>
          <span
            class="flex-1 text-sm truncate"
            :class="
              isItemDone(item)
                ? 'text-slate-500 line-through'
                : 'text-slate-200'
            "
          >
            {{ item.type === "exercise" ? item.name : item.label }}
          </span>
          <span v-if="item.type === 'exercise'" class="text-xs text-slate-500">
            {{ doneSets(item) }}/{{ item.sets }}
          </span>
          <span
            v-else-if="isItemDone(item)"
            class="chip bg-sky-400/15 text-sky-300"
            >Hecho</span
          >
        </div>
      </div>
    </section>
  </div>

  <div v-else class="grid py-24 text-center place-items-center">
    <p class="text-sm text-slate-400">No se encontró este día.</p>
  </div>
</template>

<script setup lang="ts">
import type {
  Exercise,
  Rest,
  RoutineItem,
  RunSession,
  SetState,
} from "~/types";
import {
  useStopwatch,
  useCountdown,
  formatTime,
  formatDuration,
} from "~/composables/useTimer";

const TODAY_NAME = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
][new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

const route = useRoute();
const { getDay, getActiveSession, startSession, completeSession, sessions } =
  useGymData();

const day = computed(() => getDay(String(route.params.id)));

const todayKey = new Date().toISOString().slice(0, 10);
const alreadyRunToday = computed(() =>
  sessions.value.some(
    (s) =>
      s.dayId === day.value?.id &&
      s.completed &&
      s.date.slice(0, 10) === todayKey,
  ),
);

if (day.value && (day.value.dayName !== TODAY_NAME || alreadyRunToday.value)) {
  navigateTo(`/dia/${day.value.id}`);
}

const session = ref<RunSession | null>(null);
const stopwatch = useStopwatch();
const countdown = useCountdown();

// Inter-set rest state
const setRestActive = ref(false);
const setRestSetIdx = ref(0);
const setRestItem = ref<Exercise | null>(null);

// Weight tracking
const currentWeight = ref(0);
const lastWeights = ref<Record<string, number>>({});

function activeSetIdx(item: Exercise): number {
  return firstPendingSetIdx(item);
}

const activeSetIdxNum = computed(() =>
  current.value?.type === 'exercise' ? firstPendingSetIdx(current.value) : -1
);

function getSetWeight(item: Exercise, i: number): number | null {
  const w = session.value?.setWeights[setKey(item.id, i)];
  return w != null ? w : null;
}

function hasRecordedWeights(item: Exercise): boolean {
  for (let i = 0; i < item.sets; i++) {
    if (getSetWeight(item, i) != null) return true;
  }
  return false;
}

function completeSetWithWeight(item: Exercise, i: number) {
  if (!session.value) return;
  if (i !== firstPendingSetIdx(item)) return;
  const k = setKey(item.id, i);
  session.value.setStates[k] = "done";
  if (currentWeight.value > 0) {
    session.value.setWeights[k] = currentWeight.value;
  }
  lastWeights.value[item.name] = currentWeight.value;
  const isLastSet = i === item.sets - 1;
  if (!isLastSet && item.rest_between_sets > 0) {
    startSetRest(item, i);
  }
  if (isExerciseComplete(item)) session.value.itemStates[item.id] = "done";
  // Pre-fill next set with same weight
  currentWeight.value = 0;
}

onMounted(() => {
  if (day.value)
    session.value =
      getActiveSession(day.value.id) ?? startSession(day.value.id);
  seedCurrentRest();
});

onUnmounted(() => {
  flush();
  countdown.stop();
});

const items = computed<RoutineItem[]>(() => day.value?.items ?? []);

function setKey(id: string, i: number) {
  return `${id}:${i}`;
}

function setState(item: Exercise, i: number): SetState {
  return session.value?.setStates[setKey(item.id, i)] ?? "pending";
}

function setClass(item: Exercise, i: number) {
  const s = setState(item, i);
  if (s === "done") return "border-lime bg-lime text-ink-950";
  if (s === "skipped")
    return "border-ember/50 bg-ember/10 text-ember line-through";
  const activeIdx = firstPendingSetIdx(item);
  if (i === activeIdx && !setRestActive.value)
    return "border-sky-400/60 bg-sky-400/10 text-sky-300 animate-pulse";
  return "border-white/10 bg-ink-800 text-slate-600 opacity-50";
}

function firstPendingSetIdx(item: Exercise): number {
  for (let i = 0; i < item.sets; i++) {
    if (setState(item, i) === "pending") return i;
  }
  return -1;
}

function canClickSet(item: Exercise, i: number): boolean {
  if (setRestActive.value) return false;
  const s = setState(item, i);
  if (s !== "pending") return true;
  return i === firstPendingSetIdx(item);
}

function isExerciseComplete(item: Exercise): boolean {
  for (let i = 0; i < item.sets; i++) {
    const s = session.value?.setStates[setKey(item.id, i)];
    if (s !== "done" && s !== "skipped") return false;
  }
  return true;
}

function isItemDone(item: RoutineItem): boolean {
  if (item.type === "rest")
    return session.value?.itemStates[item.id] === "done";
  return (
    isExerciseComplete(item) || session.value?.itemStates[item.id] === "done"
  );
}

const currentIdx = computed(() => items.value.findIndex((i) => !isItemDone(i)));
const current = computed(() =>
  currentIdx.value >= 0 ? items.value[currentIdx.value] : null,
);

const progress = computed(() => {
  if (!items.value.length) return 0;
  const done = items.value.filter(isItemDone).length;
  return Math.round((done / items.value.length) * 100);
});

function cycleSet(item: Exercise, i: number) {
  if (!session.value) return;
  if (!canClickSet(item, i)) return;
  const k = setKey(item.id, i);
  const cur = session.value.setStates[k] ?? "pending";

  if (cur === "pending") {
    // Complete this set → start inter-set rest if not last set
    session.value.setStates[k] = "done";
    const isLastSet = i === item.sets - 1;
    if (!isLastSet && item.rest_between_sets > 0) {
      startSetRest(item, i);
    }
    if (isExerciseComplete(item)) session.value.itemStates[item.id] = "done";
  } else if (cur === "done") {
    session.value.setStates[k] = "skipped";
  } else {
    session.value.setStates[k] = "pending";
    // If un-skipping/un-completing, unset the exercise done flag
    if (session.value.itemStates[item.id] === "done") {
      delete session.value.itemStates[item.id];
    }
  }
}

function startSetRest(item: Exercise, setIdx: number) {
  setRestActive.value = true;
  setRestSetIdx.value = setIdx;
  setRestItem.value = item;
  countdown.start(item.rest_between_sets);
}

// Auto-advance when countdown finishes
watch(
  () => countdown.finished.value,
  (done) => {
    if (done && setRestActive.value) {
      setTimeout(() => {
        if (setRestActive.value) endSetRest();
      }, 600);
    }
  },
);

// Pre-fill weight when exercise changes
watch(current, (c) => {
  if (c?.type === 'exercise') {
    const prev = lastWeights.value[c.name] ?? 0;
    currentWeight.value = prev;
  } else {
    currentWeight.value = 0;
  }
});

function endSetRest() {
  countdown.stop();
  setRestActive.value = false;
  setRestItem.value = null;
}

function skipExercise(item: Exercise) {
  if (!session.value) return;
  endSetRest();
  for (let i = 0; i < item.sets; i++) {
    const k = setKey(item.id, i);
    if ((session.value.setStates[k] ?? "pending") === "pending")
      session.value.setStates[k] = "skipped";
  }
  session.value.itemStates[item.id] = "done";
}

function doneSets(item: Exercise): number {
  let n = 0;
  for (let i = 0; i < item.sets; i++) if (setState(item, i) !== "pending") n++;
  return n;
}

function itemDotClass(item: RoutineItem) {
  if (isItemDone(item)) return "bg-lime text-ink-950";
  return "bg-white/5 text-slate-400";
}

function restCycles(item: Rest): number {
  const idx = items.value.findIndex((i) => i.id === item.id);
  for (let p = idx - 1; p >= 0; p--) {
    if (items.value[p].type === "exercise")
      return (items.value[p] as Exercise).sets;
  }
  return 1;
}

const displaySeconds = computed(() => {
  if (stopwatch.running.value || stopwatch.paused.value)
    return stopwatch.seconds.value;
  return 0;
});
const displayTenths = computed(() => {
  if (stopwatch.running.value || stopwatch.paused.value)
    return stopwatch.tenths.value;
  return 0;
});

function saveElapsed(item: Rest) {
  if (!session.value) return;
  session.value.restElapsed[item.id] = Math.floor(
    stopwatch.elapsedMs.value / 1000,
  );
}

function seedCurrentRest() {
  stopwatch.reset();
  if (current.value?.type === "rest") {
    const saved = session.value?.restElapsed[current.value.id] ?? 0;
    if (saved > 0) stopwatch.seed(saved * 1000);
  }
}

function beginRest() {
  stopwatch.start();
}

function pauseRest(item: Rest) {
  stopwatch.pause();
  saveElapsed(item);
}

function resumeRest() {
  stopwatch.resume();
}

function nextCycle(item: Rest) {
  if (!session.value) return;
  stopwatch.stop();
  saveElapsed(item);
  const cycles = restCycles(item);
  const next = (session.value.restCycle[item.id] ?? 0) + 1;
  if (next >= cycles) {
    session.value.itemStates[item.id] = "done";
    session.value.restCycle[item.id] = cycles;
    stopwatch.reset();
  } else {
    session.value.restCycle[item.id] = next;
    stopwatch.reset();
    stopwatch.start();
  }
}

function skipRest(item: Rest) {
  if (!session.value) return;
  stopwatch.reset();
  session.value.itemStates[item.id] = "done";
  session.value.restCycle[item.id] = restCycles(item);
}

function flush() {
  if (!session.value || !current.value || current.value.type !== "rest") return;
  if (stopwatch.running.value) saveElapsed(current.value as Rest);
}

watch(currentIdx, () => {
  seedCurrentRest();
  endSetRest();
});

function finish() {
  if (!session.value) return;
  flush();
  countdown.stop();
  endSetRest();
  completeSession(session.value.id);
  navigateTo("/calendario");
}

function confirmLeave() {
  flush();
  countdown.stop();
  endSetRest();
  navigateTo(`/dia/${day.value?.id}`);
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
