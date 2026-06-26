<template>
  <div v-if="day && isTodayDay && canRun" class="space-y-5">
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
        <p
          class="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-slate-400 tabular-nums"
        >
          <AppIcon name="timer" class="h-3.5 w-3.5" />
          {{ formatTime(stopwatch.seconds.value) }}
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
          <span
            class="chip bg-white/5 text-slate-400"
            :title="current.score_by === 'time' ? 'Por tiempo' : 'Por repeticiones'"
          >
            <AppIcon
              :name="current.score_by === 'time' ? 'timer' : 'dumbbell'"
              class="h-3.5 w-3.5"
            />
            {{ current.score_by === 'time' ? 'Tiempo' : 'Reps' }}
          </span>
        </div>
        <p class="mt-1.5 text-sm text-slate-400">
          {{ current.sets }} series ·
          <template v-if="current.score_by === 'reps'">
            {{ current.reps_range }} reps
          </template>
          <template v-else>
            {{ formatDuration(current.time) }} por serie
          </template>
          · RPE {{ current.rpe }}
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

        <!-- REPS MODE: weight input for the active set -->
        <div
          v-if="current.score_by === 'reps' && activeSetIdxNum >= 0 && !setRestActive"
          class="flex items-center gap-3 p-3 mt-4 border rounded-xl border-white/5 bg-ink-900/60"
        >
          <div class="flex flex-col">
            <span
              class="text-[10px] font-semibold uppercase tracking-wider text-slate-500"
              >Serie {{ activeSetIdxNum + 1 }} · peso</span
            >
            <div class="flex items-baseline gap-1 mt-1">
              <input
                :value="currentWeight"
                type="number"
                inputmode="decimal"
                min="0"
                step="0.5"
                class="w-20 text-2xl font-bold text-white bg-transparent outline-none placeholder:text-slate-600"
                placeholder="0"
                @input="
                  currentWeight =
                    parseFloat(($event.target as HTMLInputElement).value) || 0
                "
                @keydown.enter="completeSetWithWeight(current, activeSetIdxNum)"
              />
              <span class="text-sm font-medium text-slate-400">kg</span>
            </div>
          </div>
          <button
            class="btn-primary ml-auto px-4 py-2.5 text-sm"
            @click="completeSetWithWeight(current, activeSetIdxNum)"
          >
            <AppIcon name="check" class="w-4 h-4" :stroke-width="3" /> Completar
            serie
          </button>
        </div>

        <!-- TIME MODE: set timer for the active set -->
        <div
          v-else-if="current.score_by === 'time' && activeSetIdxNum >= 0 && !setRestActive && !setTimeActive"
          class="mt-4 flex flex-col items-center gap-4 p-4 border rounded-xl border-white/5 bg-ink-900/60"
        >
          <div class="flex items-baseline gap-1">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-500"
              >Serie {{ activeSetIdxNum + 1 }} ·</span
            >
            <span class="font-mono text-sm text-slate-400">{{
              formatDuration(current.time)
            }}</span>
          </div>
          <button
            class="btn-primary w-full"
            @click="startSetTime(current, activeSetIdxNum)"
          >
            <AppIcon name="play" class="w-4 h-4" /> Iniciar temporizador
          </button>
        </div>

        <!-- TIME MODE: running timer -->
        <div
          v-else-if="current.score_by === 'time' && setTimeActive"
          class="flex flex-col items-center gap-4 p-5 mt-4 border rounded-xl border-sky-400/20 bg-sky-400/5"
        >
          <span class="text-[10px] font-semibold uppercase tracking-wider text-sky-300">
            Serie {{ setTimeSetIdx + 1 }} en marcha
          </span>
          <div class="relative grid w-32 h-32 place-items-center">
            <svg
              class="absolute inset-0 w-32 h-32 -rotate-90"
              viewBox="0 0 128 128"
            >
              <circle
                cx="64"
                cy="64"
                r="58"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                stroke-width="6"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                fill="none"
                stroke="#38bdf8"
                stroke-width="6"
                stroke-linecap="round"
                :stroke-dasharray="364.42"
                :stroke-dashoffset="364.42 * (1 - setTimeCountdown.progress.value)"
                style="transition: stroke-dashoffset 0.1s linear"
              />
            </svg>
            <span
              class="font-mono text-3xl font-bold text-white tabular-nums"
              >{{ formatTime(setTimeCountdown.seconds.value) }}</span
            >
          </div>
          <div class="grid grid-cols-2 gap-2 w-full">
            <button
              v-if="setTimeCountdown.running.value"
              class="btn-ghost"
              @click="setTimeCountdown.pause()"
            >
              <AppIcon name="pause" class="w-4 h-4" /> Pausar
            </button>
            <button
              v-else
              class="btn-ghost"
              @click="setTimeCountdown.resume()"
            >
              <AppIcon name="play" class="w-4 h-4" /> Reanudar
            </button>
            <button
              class="btn-primary"
              @click="completeTimeSet(current, setTimeSetIdx)"
            >
              <AppIcon name="check" class="w-4 h-4" :stroke-width="3" />
              {{ setTimeCountdown.finished.value ? 'Continuar' : 'Completar' }}
            </button>
          </div>
        </div>

        <!-- Show recorded weights for completed sets -->
        <div
          v-if="hasRecordedWeights(current)"
          class="flex flex-wrap gap-2 mt-3 text-xs"
        >
          <span
            v-for="i in current.sets"
            :key="i"
            v-show="getSetWeight(current, i - 1) != null"
            class="chip bg-white/5 text-slate-300"
          >
            S{{ i }}:
            <b class="font-mono text-slate-200">{{
              getSetWeight(current, i - 1)
            }}</b>
            kg
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
          Descanso de {{ formatDuration(current.duration) }}
        </p>

        <div class="flex flex-col items-center mt-6">
          <div class="relative grid w-32 h-32 place-items-center">
            <svg
              class="absolute inset-0 w-32 h-32 -rotate-90"
              viewBox="0 0 128 128"
            >
              <circle
                cx="64"
                cy="64"
                r="58"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                stroke-width="6"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                fill="none"
                stroke="#38bdf8"
                stroke-width="6"
                stroke-linecap="round"
                :stroke-dasharray="364.42"
                :stroke-dashoffset="364.42 * (1 - restCountdown.progress.value)"
                style="transition: stroke-dashoffset 0.1s linear"
              />
            </svg>
            <span
              class="font-mono text-3xl font-bold text-white tabular-nums"
              >{{ formatTime(restCountdown.seconds.value) }}</span
            >
          </div>
          <p
            v-if="restCountdown.finished.value"
            class="mt-4 text-sm font-semibold text-lime"
          >
            ¡Descanso completado!
          </p>
          <p
            v-else-if="
              !restCountdown.running.value && !restCountdown.paused.value
            "
            class="mt-4 text-xs text-slate-500"
          >
            Pulsa iniciar para empezar el temporizador
          </p>
        </div>

        <!-- Add time -->
        <div
          v-if="
            !restCountdown.finished.value &&
            (restCountdown.running.value || restCountdown.paused.value)
          "
          class="grid grid-cols-3 gap-2 mt-5"
        >
          <button class="py-2 text-sm btn-ghost" @click="restCountdown.add(15)">
            +15s
          </button>
          <button class="py-2 text-sm btn-ghost" @click="restCountdown.add(30)">
            +30s
          </button>
          <button class="py-2 text-sm btn-ghost" @click="restCountdown.add(60)">
            +60s
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2 mt-3">
          <button
            v-if="
              !restCountdown.running.value &&
              !restCountdown.paused.value &&
              !restCountdown.finished.value
            "
            class="col-span-2 btn-primary"
            @click="beginRest(current)"
          >
            <AppIcon name="play" class="w-4 h-4" /> Iniciar descanso
          </button>
          <template v-else-if="!restCountdown.finished.value">
            <button
              v-if="restCountdown.running.value"
              class="btn-ghost"
              @click="pauseRest(current)"
            >
              <AppIcon name="pause" class="w-4 h-4" /> Pausar
            </button>
            <button v-else class="btn-ghost" @click="resumeRest">
              <AppIcon name="play" class="w-4 h-4" /> Reanudar
            </button>
            <button class="btn-primary" @click="skipRest(current)">
              <AppIcon name="skip" class="w-4 h-4" /> Saltar
            </button>
          </template>
          <button
            v-else
            class="col-span-2 btn-primary"
            @click="skipRest(current)"
          >
            <AppIcon name="check" class="w-4 h-4" :stroke-width="3" /> Continuar
          </button>
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

  <div v-else-if="day && isTodayDay && alreadyRunToday && !activeSession" class="grid py-24 text-center place-items-center">
    <div class="flex flex-col items-center gap-3">
      <AppIcon name="check" class="w-10 h-10 text-lime" :stroke-width="3" />
      <h2 class="text-lg font-bold text-white">Rutina completada</h2>
      <p class="max-w-xs text-sm text-slate-400">
        Ya finalizaron esta rutina hoy. No puedes volver a correrla hasta
        mañana.
      </p>
      <button class="mt-1 btn-primary" @click="navigateTo(`/dia/${day.id}`)">
        <AppIcon name="arrow-left" class="w-4 h-4" /> Volver al día
      </button>
    </div>
  </div>

  <div v-else-if="day && !isTodayDay" class="grid py-24 text-center place-items-center">
    <div class="flex flex-col items-center gap-3">
      <AppIcon name="calendar" class="w-10 h-10 text-slate-500" />
      <h2 class="text-lg font-bold text-white">No es el día de hoy</h2>
      <p class="max-w-xs text-sm text-slate-400">
        Solo puedes correr la rutina del día de hoy ({{ todayDayName }}).
        Esta rutina corresponde a <b class="text-slate-200">{{ day.dayName }}</b>.
      </p>
      <button class="mt-1 btn-primary" @click="navigateTo(`/dia/${day.id}`)">
        <AppIcon name="arrow-left" class="w-4 h-4" /> Ver día
      </button>
    </div>
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

function activeSetIdx(item: Exercise): number {
  return firstPendingSetIdx(item);
}

const activeSetIdxNum = computed(() =>
  current.value?.type === "exercise" ? firstPendingSetIdx(current.value) : -1,
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
}

onMounted(() => {
  if (!isTodayDay.value || !canRun.value) return;
  if (day.value)
    session.value =
      getActiveSession(day.value.id) ?? startSession(day.value.id);
  seedCurrentRest();
  // Start the session-wide stopwatch from the session's startedAt
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

function setState(item: Exercise, i: number): SetState {
  return session.value?.setStates[setKey(item.id, i)] ?? "pending";
}

function setClass(item: Exercise, i: number) {
  const s = setState(item, i);
  if (s === "done") return "border-lime bg-lime text-ink-950";
  if (s === "skipped")
    return "border-ember/50 bg-ember/10 text-ember line-through";
  const activeIdx = firstPendingSetIdx(item);
  if (i === activeIdx && !setRestActive.value && !setTimeActive.value)
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
  if (setRestActive.value || setTimeActive.value) return false;
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
function startSetTime(item: Exercise, setIdx: number) {
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

function completeTimeSet(item: Exercise, i: number) {
  if (!session.value) return;
  const k = setKey(item.id, i);
  session.value.setStates[k] = "done";
  if (currentWeight.value > 0) {
    session.value.setWeights[k] = currentWeight.value;
  }
  lastWeights.value[item.name] = currentWeight.value;
  endSetTime();
  const isLastSet = i === item.sets - 1;
  if (!isLastSet && item.rest_between_sets > 0) {
    startSetRest(item, i);
  }
  if (isExerciseComplete(item)) session.value.itemStates[item.id] = "done";
}

// Auto-complete the set when the time countdown finishes
watch(
  () => setTimeCountdown.finished.value,
  (done) => {
    if (!done || !setTimeActive.value) return;
    const item = setTimeItem.value;
    const idx = setTimeSetIdx.value;
    if (item && idx >= 0) completeTimeSet(item, idx);
  },
);

function skipExercise(item: Exercise) {
  if (!session.value) return;
  endSetRest();
  endSetTime();
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

function beginRest(item: Rest) {
  restCountdown.start(item.duration);
}

function pauseRest(item: Rest) {
  restCountdown.pause();
  saveRestRemaining(item);
}

function resumeRest() {
  restCountdown.resume();
}

function skipRest(item: Rest) {
  if (!session.value) return;
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
