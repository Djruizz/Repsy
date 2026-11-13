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
        @pause="pauseSetRest"
        @resume="resumeSetRest"
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
      :is-past="isPastView"
      @cycle-set="cycleSet"
      @complete-set-with-weight="completeSetWithWeight"
      @start-set-time="startSetTime"
      @complete-time-set="completeTimeSet"
      @skip-exercise="skipExercise"
      @pause-set-time="pauseSetTime"
      @resume-set-time="resumeSetTime"
      @update-set-weight="setSetWeight"
      @back-to-current="exitReview"
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
      @add="addRestTime"
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
      :view-idx="viewIdx"
      @select="selectPastItem"
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
import type { ActiveTimerKind, Exercise, Rest, RoutineItem, RunSession } from "~/types";
import { useStopwatch, useCountdown } from "~/composables/useTimer";
import { useSoundCue } from "~/composables/useSoundCue";
import { useTimerNotifications } from "~/composables/useTimerNotifications";
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
const { playFinishCue, unlockAudio } = useSoundCue();
const {
  notifyTimerFinished,
  clearProgressNotification,
  startLockScreenSession,
  updateLockScreenMetadata,
  stopLockScreenSession,
  acquireWakeLock,
  releaseWakeLock,
} = useTimerNotifications();
const sessionReady = ref(false);

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
  const restored = restoreActiveTimer();
  if (!restored) seedCurrentRest();
  if (session.value?.startedAt) {
    const elapsed = Date.now() - new Date(session.value.startedAt).getTime();
    stopwatch.seed(Math.max(0, elapsed));
    stopwatch.resume();
  }
  void acquireWakeLock();
  nextTick(() => {
    sessionReady.value = true;
  });
}

function onVisibilityChange() {
  if (typeof document === "undefined") return;
  if (document.visibilityState === "visible") {
    void clearProgressNotification();
  } else if (activeLockScreenInfo.value) {
    updateLockScreenMetadata(activeLockScreenInfo.value);
  }
}

onMounted(() => {
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVisibilityChange);
  }
  if (!allowRun.value) return;
  initSession();
});

function runAnyway() {
  overrideNotToday.value = true;
  initSession();
}

onUnmounted(() => {
  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", onVisibilityChange);
  }
  flush();
  countdown.stop();
  restCountdown.stop();
  setTimeCountdown.stop();
  autoCountdown.stop();
  stopwatch.stop();
  stopLockScreenSession();
  void releaseWakeLock();
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
// Revisión: override manual para volver a ejercicios anteriores completados
const viewIdx = ref<number | null>(null);
const displayIdx = computed(() => viewIdx.value ?? currentIdx.value);
const current = computed(() =>
  displayIdx.value >= 0 ? items.value[displayIdx.value] : null,
);
const isPastView = computed(
  () => viewIdx.value != null && viewIdx.value !== currentIdx.value,
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

function syncActiveTimer(
  kind: ActiveTimerKind,
  itemId: string,
  cd: ReturnType<typeof useCountdown>,
  setIdx?: number,
) {
  if (!session.value) return;
  if (cd.running.value && cd.endAt.value != null) {
    session.value.activeTimer = {
      kind,
      itemId,
      ...(setIdx != null ? { setIdx } : {}),
      targetMs: cd.targetMs.value,
      endAt: cd.endAt.value,
    };
  } else if (cd.paused.value) {
    session.value.activeTimer = {
      kind,
      itemId,
      ...(setIdx != null ? { setIdx } : {}),
      targetMs: cd.targetMs.value,
      pausedRemainingMs: cd.remainingMs.value,
    };
  } else if (session.value.activeTimer?.kind === kind) {
    session.value.activeTimer = null;
  }
}

function clearActiveTimer(kind?: ActiveTimerKind) {
  if (!session.value?.activeTimer) return;
  if (!kind || session.value.activeTimer.kind === kind) {
    session.value.activeTimer = null;
  }
}

function bindSetRestLockScreen() {
  startLockScreenSession({
    onPause: pauseSetRest,
    onResume: resumeSetRest,
    onSkip: endSetRest,
  });
}

function bindSetTimeLockScreen() {
  startLockScreenSession({
    onPause: pauseSetTime,
    onResume: resumeSetTime,
    onSkip: () => {
      if (setTimeSetIdx.value >= 0) completeTimeSet(setTimeSetIdx.value);
    },
  });
}

function bindRestLockScreen() {
  startLockScreenSession({
    onPause: pauseRest,
    onResume: resumeRest,
    onSkip: skipRest,
  });
}

function restoreActiveTimer(): boolean {
  const at = session.value?.activeTimer;
  if (!session.value || !at || !current.value || current.value.id !== at.itemId) {
    clearActiveTimer();
    return false;
  }
  if (at.kind === "rest-item" && current.value.type === "rest") {
    if (at.endAt != null) {
      if (Date.now() >= at.endAt) {
        session.value.itemStates[at.itemId] = "done";
        delete session.value.restElapsed[at.itemId];
        delete session.value.restCycle[at.itemId];
        session.value.activeTimer = null;
        return true;
      }
      restCountdown.restoreFromWallClock(at.endAt, at.targetMs);
      bindRestLockScreen();
      return true;
    }
    if (at.pausedRemainingMs != null) {
      restCountdown.seedMs(at.pausedRemainingMs, at.targetMs);
      return true;
    }
  }
  if (at.kind === "set-rest" && current.value.type === "exercise" && at.setIdx != null) {
    setRestActive.value = true;
    setRestSetIdx.value = at.setIdx;
    setRestItem.value = current.value;
    if (at.endAt != null) {
      countdown.restoreFromWallClock(at.endAt, at.targetMs);
      if (countdown.finished.value) {
        session.value.activeTimer = null;
      } else {
        bindSetRestLockScreen();
      }
      return true;
    }
    if (at.pausedRemainingMs != null) {
      countdown.seedMs(at.pausedRemainingMs, at.targetMs);
      return true;
    }
  }
  if (at.kind === "set-time" && current.value.type === "exercise" && at.setIdx != null) {
    const st = session.value.setStates[setKey(at.itemId, at.setIdx)] ?? "pending";
    if (st !== "pending") {
      session.value.activeTimer = null;
      return false;
    }
    setTimeActive.value = true;
    setTimeSetIdx.value = at.setIdx;
    setTimeItem.value = current.value;
    if (at.endAt != null) {
      setTimeCountdown.restoreFromWallClock(at.endAt, at.targetMs);
      if (!setTimeCountdown.finished.value) bindSetTimeLockScreen();
      return true;
    }
    if (at.pausedRemainingMs != null) {
      setTimeCountdown.seedMs(at.pausedRemainingMs, at.targetMs);
      return true;
    }
  }
  clearActiveTimer();
  return false;
}

const activeLockScreenInfo = computed(() => {
  if (
    setRestActive.value &&
    setRestItem.value &&
    (countdown.running.value || countdown.paused.value)
  ) {
    return {
      title: "Descanso entre series",
      subtitle: `${setRestItem.value.name} · Serie ${setRestSetIdx.value + 1} → ${setRestSetIdx.value + 2}`,
      remainingSec: countdown.seconds.value,
      totalSec: Math.round(countdown.targetMs.value / 1000),
      running: countdown.running.value,
      endAt: countdown.endAt.value,
    };
  }
  if (
    currentRest.value &&
    (restCountdown.running.value || restCountdown.paused.value)
  ) {
    return {
      title: currentRest.value.label || "Descanso",
      subtitle: day.value?.routineName || day.value?.dayName || "Repsy",
      remainingSec: restCountdown.seconds.value,
      totalSec: Math.round(restCountdown.targetMs.value / 1000),
      running: restCountdown.running.value,
      endAt: restCountdown.endAt.value,
    };
  }
  if (
    setTimeActive.value &&
    setTimeItem.value &&
    (setTimeCountdown.running.value || setTimeCountdown.paused.value)
  ) {
    return {
      title: setTimeItem.value.name,
      subtitle: `Serie ${setTimeSetIdx.value + 1} de ${setTimeItem.value.sets}`,
      remainingSec: setTimeCountdown.seconds.value,
      totalSec: Math.round(setTimeCountdown.targetMs.value / 1000),
      running: setTimeCountdown.running.value,
      endAt: setTimeCountdown.endAt.value,
    };
  }
  return null;
});

watch(activeLockScreenInfo, (info) => {
  if (info) updateLockScreenMetadata(info);
});

function startSetRest(setIdx: number) {
  const item = currentExercise.value;
  if (!item) return;
  unlockAudio();
  setRestActive.value = true;
  setRestSetIdx.value = setIdx;
  setRestItem.value = item;
  countdown.start(item.rest_between_sets);
  syncActiveTimer("set-rest", item.id, countdown, setIdx);
  bindSetRestLockScreen();
}

function pauseSetRest() {
  countdown.pause();
  if (setRestItem.value) {
    syncActiveTimer("set-rest", setRestItem.value.id, countdown, setRestSetIdx.value);
  }
}

function resumeSetRest() {
  unlockAudio();
  countdown.resume();
  if (setRestItem.value) {
    syncActiveTimer("set-rest", setRestItem.value.id, countdown, setRestSetIdx.value);
    bindSetRestLockScreen();
  }
}

// Cue sound + notificación cuando el descanso entre series llega a cero.
watch(
  () => countdown.finished.value,
  (done) => {
    if (!done || !setRestActive.value) return;
    playFinishCue();
    stopLockScreenSession();
    clearActiveTimer("set-rest");
    void notifyTimerFinished(
      "¡Descanso completado!",
      `${setRestItem.value?.name ?? "Ejercicio"} · Serie ${setRestSetIdx.value + 2} lista`,
    );
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
  if (sessionReady.value) endSetTime();
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
  clearActiveTimer("set-rest");
  if (!setTimeActive.value) stopLockScreenSession();
}

// ── Time-based set timer ──────────────────────────────────────────────
function startSetTime(setIdx: number) {
  const item = currentExercise.value;
  if (!item) return;
  unlockAudio();
  setTimeActive.value = true;
  setTimeSetIdx.value = setIdx;
  setTimeItem.value = item;
  setTimeCountdown.start(item.time);
  syncActiveTimer("set-time", item.id, setTimeCountdown, setIdx);
  bindSetTimeLockScreen();
}

function pauseSetTime() {
  setTimeCountdown.pause();
  if (setTimeItem.value) {
    syncActiveTimer("set-time", setTimeItem.value.id, setTimeCountdown, setTimeSetIdx.value);
  }
}

function resumeSetTime() {
  unlockAudio();
  setTimeCountdown.resume();
  if (setTimeItem.value) {
    syncActiveTimer("set-time", setTimeItem.value.id, setTimeCountdown, setTimeSetIdx.value);
    bindSetTimeLockScreen();
  }
}

function endSetTime() {
  setTimeCountdown.stop();
  setTimeActive.value = false;
  setTimeItem.value = null;
  setTimeSetIdx.value = -1;
  clearActiveTimer("set-time");
  if (!setRestActive.value) stopLockScreenSession();
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
    clearActiveTimer("set-time");
    const idx = setTimeSetIdx.value;
    const itemName = setTimeItem.value?.name ?? "Ejercicio";
    void notifyTimerFinished(
      "¡Serie completada!",
      `${itemName} · Serie ${idx + 1}`,
    );
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

// ── Revisión de ejercicios anteriores ─────────────────────────────────
function selectPastItem(idx: number) {
  const item = items.value[idx];
  if (!item || item.type !== "exercise") return;
  if (idx === viewIdx.value) {
    exitReview();
    return;
  }
  if (idx === currentIdx.value || !isItemDone(item)) return;
  // Guardar el descanso en curso antes de revisar otro ejercicio
  const cur = current.value;
  if (
    cur?.type === "rest" &&
    (restCountdown.running.value || restCountdown.paused.value)
  ) {
    saveRestRemaining(cur);
  }
  viewIdx.value = idx;
}

function exitReview() {
  viewIdx.value = null;
}

function setSetWeight(idx: number, weight: number) {
  if (!session.value) return;
  const item = currentExercise.value;
  if (!item || !isPastView.value) return;
  touch();
  const k = setKey(item.id, idx);
  if (weight > 0) {
    session.value.setWeights[k] = weight;
    lastWeights.value[item.name] = weight;
  } else {
    delete session.value.setWeights[k];
  }
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
  unlockAudio();
  touch();
  restCountdown.start(item.duration);
  syncActiveTimer("rest-item", item.id, restCountdown);
  bindRestLockScreen();
}

function pauseRest() {
  const item = currentRest.value;
  if (!item) return;
  touch();
  restCountdown.pause();
  if (restCountdown.finished.value) return;
  saveRestRemaining(item);
  syncActiveTimer("rest-item", item.id, restCountdown);
}

function resumeRest() {
  const item = currentRest.value;
  if (!item) return;
  unlockAudio();
  restCountdown.resume();
  syncActiveTimer("rest-item", item.id, restCountdown);
  bindRestLockScreen();
}

function addRestTime(seconds: number) {
  const item = currentRest.value;
  if (!item) return;
  touch();
  restCountdown.add(seconds);
  if (restCountdown.paused.value) saveRestRemaining(item);
  syncActiveTimer("rest-item", item.id, restCountdown);
}

function skipRest() {
  if (!session.value) return;
  const item = currentRest.value;
  if (!item) return;
  touch();
  restCountdown.stop();
  delete session.value.restElapsed[item.id];
  delete session.value.restCycle[item.id];
  clearActiveTimer("rest-item");
  stopLockScreenSession();
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
    stopLockScreenSession();
    clearActiveTimer("rest-item");
    delete session.value.restElapsed[item.id];
    delete session.value.restCycle[item.id];
    touch();
    session.value.itemStates[item.id] = "done";
    void notifyTimerFinished(
      "¡Descanso completado!",
      `${item.label || "Descanso"} · Hora de continuar`,
    );
  },
);

function flush() {
  if (!session.value || !current.value || current.value.type !== "rest") return;
  if (restCountdown.running.value || restCountdown.paused.value) {
    saveRestRemaining(current.value as Rest);
  }
}

watch(displayIdx, () => {
  if (!sessionReady.value) return;
  seedCurrentRest();
  endSetRest();
  endSetTime();
});

// Si el avance real alcanza al ítem revisado (serie des-marcada), la
// revisión termina: ese ítem vuelve a ser el actual.
watch(currentIdx, () => {
  viewIdx.value = null;
});

// Auto-finalización: rutina completa → cuenta atrás cancelable. Si el
// usuario sale antes (o cancela), la sesión se rescata al día siguiente.
// En revisión (displayIdx >= 0) la cuenta se detiene y al volver al final
// arranca de nuevo.
watch(
  displayIdx,
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
  clearActiveTimer();
  stopLockScreenSession();
  void releaseWakeLock();
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
  if (current.value?.type === "rest" && restCountdown.running.value) {
    pauseRest();
  } else {
    flush();
  }
  countdown.stop();
  restCountdown.stop();
  setTimeCountdown.stop();
  autoCountdown.stop();
  stopwatch.stop();
  endSetRest();
  endSetTime();
  stopLockScreenSession();
  void releaseWakeLock();
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
