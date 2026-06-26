<template>
  <div v-if="day && isTodayDay && canRun" class="space-y-5">
    <RunHeader
      :day-name="day.dayName"
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

    <RunCompleteState v-else @finish="finish" />

    <RunRoutineProgress
      :items="day.items"
      :current-idx="currentIdx"
      :session="session"
    />
  </div>

  <RunAlreadyDoneState
    v-else-if="day && isTodayDay && alreadyRunToday && !activeSession"
    @back="navigateTo(`/dia/${day.id}`)"
  />

  <RunNotTodayState
    v-else-if="day && !isTodayDay"
    :today-day-name="todayDayName"
    :day-name="day.dayName"
    @back="navigateTo(`/dia/${day.id}`)"
  />

  <RunNotFoundState v-else />
</template>

<script setup lang="ts">
import type {
  Exercise,
  Rest,
  RoutineItem,
  RunSession,
} from "~/types";
import {
  useStopwatch,
  useCountdown,
} from "~/composables/useTimer";
import { weekdayName, localDayKey, todayKey as todayLocalKey } from "~/composables/useCalendar";

const route = useRoute();
const { getDay, getActiveSession, startSession, completeSession, sessions } =
  useGymData();

const day = computed(() => getDay(String(route.params.id)));
const todayDayName = computed(() => weekdayName(new Date()));
const isTodayDay = computed(
  () => day.value?.dayName === todayDayName.value,
);
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
const canRun = computed(() => !alreadyRunToday.value || !!activeSession.value);

const session = ref<RunSession | null>(null);
const stopwatch = useStopwatch();
const countdown = useCountdown();
const restCountdown = useCountdown();
const setTimeCountdown = useCountdown();

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

onMounted(() => {
  if (!isTodayDay.value || !canRun.value) return;
  if (day.value)
    session.value =
      getActiveSession(day.value.id) ?? startSession(day.value.id);
  seedCurrentRest();
  if (session.value?.startedAt) {
    const elapsed = Date.now() - new Date(session.value.startedAt).getTime();
    stopwatch.seed(Math.max(0, elapsed));
    stopwatch.resume();
  }
});

onUnmounted(() => {
  flush();
  countdown.stop();
  restCountdown.stop();
  setTimeCountdown.stop();
  stopwatch.stop();
});

const items = computed<RoutineItem[]>(() => day.value?.items ?? []);

function setKey(id: string, i: number) {
  return `${id}:${i}`;
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
  endSetTime();
  if (c?.type === "exercise") {
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
    const idx = setTimeSetIdx.value;
    if (idx >= 0) completeTimeSet(idx);
  },
);

function skipExercise() {
  if (!session.value) return;
  const item = currentExercise.value;
  if (!item) return;
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
}

function seedCurrentRest() {
  restCountdown.stop();
  if (current.value?.type === "rest") {
    const saved = session.value?.restElapsed[current.value.id] ?? 0;
    if (saved > 0 && session.value?.itemStates[current.value.id] !== "done") {
      restCountdown.seed(saved, current.value.duration);
    }
  }
}

function beginRest() {
  const item = currentRest.value;
  if (!item) return;
  restCountdown.start(item.duration);
}

function pauseRest() {
  const item = currentRest.value;
  if (!item) return;
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
  restCountdown.stop();
  session.value.itemStates[item.id] = "done";
}

// Auto-complete rest when the countdown finishes
watch(
  () => restCountdown.finished.value,
  (done) => {
    if (!done) return;
    const item = current.value;
    if (item?.type !== "rest") return;
    if (session.value?.itemStates[item.id] === "done") return;
    saveRestRemaining(item as Rest);
    const itemId = item.id;
    setTimeout(() => {
      if (session.value && session.value.itemStates[itemId] !== "done") {
        session.value.itemStates[itemId] = "done";
      }
    }, 900);
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

function finish() {
  if (!session.value) return;
  flush();
  countdown.stop();
  restCountdown.stop();
  setTimeCountdown.stop();
  if (session.value.startedAt) {
    session.value.durationMs =
      Date.now() - new Date(session.value.startedAt).getTime();
  }
  stopwatch.stop();
  endSetRest();
  endSetTime();
  completeSession(session.value.id);
  navigateTo("/calendario");
}

function confirmLeave() {
  flush();
  countdown.stop();
  restCountdown.stop();
  setTimeCountdown.stop();
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
