<template>
  <div v-if="day && allowRun" class="space-y-5">
    <RunHeader
      :day-name="day.dayName || 'Rutina libre'"
      :routine-name="day.routineName"
      :seconds="stopwatch.seconds.value"
      @leave="confirmLeave"
      @finish="finish"
    />

    <RunProgressBar :progress="progress" />

    <!-- INTER-SET REST TIMER OVERLAY -->
    <Transition name="slide-up">
      <RunSetRestOverlay
        v-if="setRestActive && current?.type === 'exercise'"
        :set-idx="setRestSetIdx"
        :seconds="countdown.seconds.value"
        :progress="countdown.progress.value"
        :running="countdown.running.value"
        :finished="countdown.finished.value"
        @pause="countdown.pause()"
        @resume="countdown.resume()"
        @end="endSetRest"
      />
    </Transition>

    <RunExerciseItem
      v-if="currentExercise"
      :item="currentExercise"
      :index="currentIdx + 1"
      :total="day.items.length"
      :session="session"
      :set-rest-active="setRestActive"
      :set-time="{
        active: setTimeActive,
        setIdx: setTimeSetIdx,
        seconds: setTimeCountdown.seconds.value,
        progress: setTimeCountdown.progress.value,
        running: setTimeCountdown.running.value,
        finished: setTimeCountdown.finished.value,
      }"
      v-model:current-weight="currentWeight"
      @cycle-set="cycleSet"
      @complete-set-with-weight="completeSetWithWeight"
      @start-set-time="startSetTime"
      @complete-time-set="completeTimeSet"
      @skip-exercise="skipExercise"
      @pause-set-time="setTimeCountdown.pause()"
      @resume-set-time="setTimeCountdown.resume()"
    />

    <RunRestItem
      v-else-if="currentRest"
      :item="currentRest"
      :index="currentIdx + 1"
      :total="day.items.length"
      :seconds="restCountdown.seconds.value"
      :progress="restCountdown.progress.value"
      :running="restCountdown.running.value"
      :paused="restCountdown.paused.value"
      :finished="restCountdown.finished.value"
      @begin="beginRest"
      @pause="pauseRest"
      @resume="resumeRest"
      @skip="skipRest"
      @add="restCountdown.add"
    />

    <RunCompleteState
      v-else
      :auto-seconds="autoCountdown.seconds.value"
      :auto-active="autoCountdown.running.value"
      @finish="finish"
      @cancel="cancelAutoFinish"
    />

    <RunRoutineProgress
      :items="day.items"
      :current-idx="currentIdx"
      :session="session"
    />
  </div>

  <RunAlreadyDoneState
    v-else-if="day && alreadyRunToday && !activeSession"
    @back="navigateTo(`/dia/${day.id}`)"
  />

  <RunNotTodayState
    v-else-if="day && !isTodayDay && !isFreeRoutine"
    :today-day-name="todayDayName"
    :day-name="day.dayName"
    @back="navigateTo(`/dia/${day.id}`)"
    @run-anyway="runAnyway"
  />

  <RunNotFoundState v-else />
</template>

<script setup lang="ts">
import type { Exercise, Rest, RoutineItem, RunSession } from "~/types";
import { useStopwatch, useCountdown } from "~/composables/useTimer";
import { useSoundCue } from "~/composables/useSoundCue";
import {
  weekdayName,
  localDayKey,
  todayKey as todayLocalKey,
} from "~/composables/useCalendar";

const route = useRoute();
const {
  getDay,
  getActiveSession,
  startSession,
  completeSession,
  deleteSession,
  isSessionComplete,
  rescueSession,
  sessions,
  getWeightHistory,
} = useGymData();

const day = computed(() => getDay(String(route.params.id)));
const todayDayName = computed(() => weekdayName(new Date()));
const isTodayDay = computed(() => day.value?.dayName === todayDayName.value);
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
// Rutina libre (sin weekday): corrible cualquier día sin aviso
const isFreeRoutine = computed(() => day.value?.dayName === "");
const canRun = computed(() => !alreadyRunToday.value || !!activeSession.value);
// Se puede correr la rutina de otro día (recuperación) tras confirmar el aviso
const overrideNotToday = ref(false);
const allowRun = computed(
  () =>
    canRun.value &&
    (isTodayDay.value || overrideNotToday.value || isFreeRoutine.value),
);

const session = ref<RunSession | null>(null);
const stopwatch = useStopwatch();
const countdown = useCountdown();
const restCountdown = useCountdown();
const setTimeCountdown = useCountdown();
const autoCountdown = useCountdown();
const { playFinishCue } = useSoundCue();

// Auto-finalización: al completar la rutina, cuenta atrás cancelable
const AUTO_FINISH_SECONDS = 15;
const autoFinishCancelled = ref(false);

// Inter-set rest state
const setRestActive = ref(false);
const setRestSetIdx = ref(0);
const setRestItem = ref<Exercise | null>(null);

// Time-based set state
const setTimeActive = ref(false);
const setTimeSetIdx = ref(-1);
const setTimeItem = ref<Exercise | null>(null);

// Weight tracking
const currentWeight = ref(0);
const lastWeights = ref<Record<string, number>>({});

function initSession() {
  if (!day.value) return;
  let existing = getActiveSession(day.value.id);
  // Sesión abandonada en un día anterior: si estaba completa se rescata
  // (cuenta para el día que se entrenó); si no, se descarta.
  if (existing && localDayKey(existing.startedAt) !== todayKey.value) {
    if (isSessionComplete(existing)) {
      rescueSession(existing.id);
    } else {
      deleteSession(existing.id);
    }
    existing = undefined;
  }
  // Rutina vacía: no crear sesión (una sesión de 0 ejercicios marcaría
  // el día como completado sin haber entrenado)
  if (day.value.items.length > 0) {
    session.value = existing ?? startSession(day.value.id);
  }
  seedCurrentRest();
  if (session.value?.startedAt) {
    const elapsed = Date.now() - new Date(session.value.startedAt).getTime();
    stopwatch.seed(Math.max(0, elapsed));
    stopwatch.resume();
  }
}

onMounted(() => {
  if (!allowRun.value) return;
  initSession();
});

function runAnyway() {
  overrideNotToday.value = true;
  initSession();
}

onUnmounted(() => {
  flush();
  countdown.stop();
  restCountdown.stop();
  setTimeCountdown.stop();
  autoCountdown.stop();
  stopwatch.stop();
});

const items = computed<RoutineItem[]>(() => day.value?.items ?? []);

function setKey(id: string, i: number) {
  return `${id}:${i}`;
}

// Sella la última actividad: permite calcular la duración real de sesiones
// auto-finalizadas o rescatadas al día siguiente.
function touch() {
  if (session.value) session.value.lastActiveAt = new Date().toISOString();
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
const currentExercise = computed(() =>
  current.value?.type === "exercise" ? current.value : undefined,
);
const currentRest = computed(() =>
  current.value?.type === "rest" ? current.value : undefined,
);

const progress = computed(() => {
  if (!items.value.length) return 0;
  const done = items.value.filter(isItemDone).length;
  return Math.round((done / items.value.length) * 100);
});

function cycleSet(i: number) {
  if (!session.value) return;
  const item = currentExercise.value;
  if (!item) return;
  if (setRestActive.value || setTimeActive.value) return;
  touch();
  const k = setKey(item.id, i);
  const cur = session.value.setStates[k] ?? "pending";

  if (cur === "pending") {
    session.value.setStates[k] = "done";
    const isLastSet = i === item.sets - 1;
    if (!isLastSet && item.rest_between_sets > 0) {
      startSetRest(i);
    }
    if (isExerciseComplete(item)) session.value.itemStates[item.id] = "done";
  } else if (cur === "done") {
    session.value.setStates[k] = "skipped";
  } else {
    session.value.setStates[k] = "pending";
    if (session.value.itemStates[item.id] === "done") {
      delete session.value.itemStates[item.id];
    }
  }
}

function startSetRest(setIdx: number) {
  const item = currentExercise.value;
  if (!item) return;
  setRestActive.value = true;
  setRestSetIdx.value = setIdx;
  setRestItem.value = item;
  countdown.start(item.rest_between_sets);
}

// Cue sound when the inter-set rest countdown reaches zero (so the user
// hears the "go" cue even before pressing Terminar).
watch(
  () => countdown.finished.value,
  (done) => {
    if (done && setRestActive.value) playFinishCue();
  },
);

// Pre-fill weight when exercise changes: peso de esta sesión o, tras recargar,
// el último peso registrado para ese ejercicio en el historial.
function lastWeightFor(name: string): number {
  const history = getWeightHistory(name);
  if (!history.length) return 0;
  let lastKey = "";
  let max = 0;
  for (const e of history) {
    const k = localDayKey(e.date);
    if (k !== lastKey) {
      lastKey = k;
      max = e.weight;
    } else if (e.weight > max) {
      max = e.weight;
    }
  }
  return max;
}

watch(current, (c) => {
  endSetTime();
  if (c?.type === "exercise") {
    currentWeight.value = lastWeights.value[c.name] ?? lastWeightFor(c.name);
  } else {
    currentWeight.value = 0;
  }
});

function endSetRest() {
  countdown.stop();
  setRestActive.value = false;
  setRestItem.value = null;
}

// ── Time-based set timer ──────────────────────────────────────────────
function startSetTime(setIdx: number) {
  const item = currentExercise.value;
  if (!item) return;
  setTimeActive.value = true;
  setTimeSetIdx.value = setIdx;
  setTimeItem.value = item;
  setTimeCountdown.start(item.time);
}

function endSetTime() {
  setTimeCountdown.stop();
  setTimeActive.value = false;
  setTimeItem.value = null;
  setTimeSetIdx.value = -1;
}

function completeSetWithWeight(i: number) {
  if (!session.value) return;
  const item = currentExercise.value;
  if (!item) return;
  touch();
  const k = setKey(item.id, i);
  session.value.setStates[k] = "done";
  if (currentWeight.value > 0) {
    session.value.setWeights[k] = currentWeight.value;
  }
  lastWeights.value[item.name] = currentWeight.value;
  const isLastSet = i === item.sets - 1;
  if (!isLastSet && item.rest_between_sets > 0) {
    startSetRest(i);
  }
  if (isExerciseComplete(item)) session.value.itemStates[item.id] = "done";
}

function completeTimeSet(i: number) {
  if (!session.value) return;
  const item = currentExercise.value;
  if (!item) return;
  touch();
  const k = setKey(item.id, i);
  session.value.setStates[k] = "done";
  if (currentWeight.value > 0) {
    session.value.setWeights[k] = currentWeight.value;
  }
  lastWeights.value[item.name] = currentWeight.value;
  endSetTime();
  const isLastSet = i === item.sets - 1;
  if (!isLastSet && item.rest_between_sets > 0) {
    startSetRest(i);
  }
  if (isExerciseComplete(item)) session.value.itemStates[item.id] = "done";
}

// Auto-complete the set when the time countdown finishes
watch(
  () => setTimeCountdown.finished.value,
  (done) => {
    if (!done || !setTimeActive.value) return;
    playFinishCue();
    const idx = setTimeSetIdx.value;
    if (idx >= 0) completeTimeSet(idx);
  },
);

function skipExercise() {
  if (!session.value) return;
  const item = currentExercise.value;
  if (!item) return;
  touch();
  endSetRest();
  endSetTime();
  for (let i = 0; i < item.sets; i++) {
    const k = setKey(item.id, i);
    if ((session.value.setStates[k] ?? "pending") === "pending")
      session.value.setStates[k] = "skipped";
  }
  session.value.itemStates[item.id] = "done";
}

function saveRestRemaining(item: Rest) {
  if (!session.value) return;
  session.value.restElapsed[item.id] = restCountdown.seconds.value;
  // Guardar también el objetivo efectivo (incluye los +15/+30/+60s añadidos)
  session.value.restCycle[item.id] = Math.round(
    restCountdown.targetMs.value / 1000,
  );
}

function seedCurrentRest() {
  restCountdown.stop();
  if (current.value?.type === "rest") {
    const saved = session.value?.restElapsed[current.value.id] ?? 0;
    if (saved > 0 && session.value?.itemStates[current.value.id] !== "done") {
      const target =
        session.value?.restCycle[current.value.id] ?? current.value.duration;
      restCountdown.seed(saved, Math.max(target, saved));
    }
  }
}

function beginRest() {
  const item = currentRest.value;
  if (!item) return;
  touch();
  restCountdown.start(item.duration);
}

function pauseRest() {
  const item = currentRest.value;
  if (!item) return;
  touch();
  restCountdown.pause();
  saveRestRemaining(item);
}

function resumeRest() {
  restCountdown.resume();
}

function skipRest() {
  if (!session.value) return;
  const item = currentRest.value;
  if (!item) return;
  touch();
  restCountdown.stop();
  session.value.itemStates[item.id] = "done";
}

// Auto-complete rest when the countdown finishes: se marca done de inmediato
// (si el usuario sale justo entonces, el descanso no se reinicia al volver).
watch(
  () => restCountdown.finished.value,
  (done) => {
    if (!done) return;
    const item = current.value;
    if (item?.type !== "rest") return;
    if (!session.value || session.value.itemStates[item.id] === "done") return;
    playFinishCue();
    touch();
    session.value.itemStates[item.id] = "done";
  },
);

function flush() {
  if (!session.value || !current.value || current.value.type !== "rest") return;
  if (restCountdown.running.value || restCountdown.paused.value) {
    saveRestRemaining(current.value as Rest);
  }
}

watch(currentIdx, () => {
  seedCurrentRest();
  endSetRest();
  endSetTime();
});

// Auto-finalización: rutina completa → cuenta atrás cancelable. Si el
// usuario sale antes (o cancela), la sesión se rescata al día siguiente.
watch(
  currentIdx,
  (idx) => {
    if (idx >= 0) {
      autoFinishCancelled.value = false;
      autoCountdown.stop();
      return;
    }
    if (
      session.value &&
      !session.value.completed &&
      items.value.length > 0 &&
      !autoFinishCancelled.value
    ) {
      autoCountdown.start(AUTO_FINISH_SECONDS);
    }
  },
  { immediate: true },
);

watch(
  () => autoCountdown.finished.value,
  (done) => {
    if (done) finish();
  },
);

function cancelAutoFinish() {
  autoFinishCancelled.value = true;
  autoCountdown.stop();
}

function finish() {
  if (!session.value) return;
  flush();
  countdown.stop();
  restCountdown.stop();
  setTimeCountdown.stop();
  autoCountdown.stop();
  if (session.value.startedAt) {
    session.value.durationMs =
      Date.now() - new Date(session.value.startedAt).getTime();
  }
  stopwatch.stop();
  endSetRest();
  endSetTime();
  playFinishCue();
  completeSession(session.value.id);
  navigateTo("/calendario");
}

function confirmLeave() {
  // Rutina completa y cuenta no cancelada: finalizar en vez de dejarla
  // activa (así el entreno cuenta aunque el usuario se marche ya)
  if (
    session.value &&
    !session.value.completed &&
    items.value.length > 0 &&
    !autoFinishCancelled.value &&
    currentIdx.value === -1
  ) {
    finish();
    return;
  }
  flush();
  countdown.stop();
  restCountdown.stop();
  setTimeCountdown.stop();
  autoCountdown.stop();
  stopwatch.stop();
  endSetRest();
  endSetTime();
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
