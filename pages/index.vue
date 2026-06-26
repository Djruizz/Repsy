<template>
  <div class="space-y-6">
    <section class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-white">Semana</h1>
        <p class="mt-1 text-sm text-slate-400">{{ monthLabel(weekStart) }}</p>
      </div>
      <div class="flex items-center gap-1.5">
        <button class="px-3 py-2 btn-ghost" @click="offset--">
          <AppIcon name="arrow-left" class="w-4 h-4" />
        </button>
        <button class="px-3 py-2 text-xs btn-ghost" @click="offset = 0">
          Esta semana
        </button>
        <button
          class="px-3 py-2 btn-ghost"
          @click="offset++"
          :disabled="offset >= 0"
        >
          <AppIcon name="arrow-right" class="w-4 h-4" />
        </button>
      </div>
    </section>

    <div class="flex justify-center">
      <div class="inline-flex p-1 border rounded-xl border-white/5 bg-ink-850">
        <button
          class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
          :class="
            view === 'list'
              ? 'bg-lime text-ink-950'
              : 'text-slate-400 hover:text-slate-200'
          "
          @click="view = 'list'"
        >
          <AppIcon name="list" class="w-4 h-4" /> Lista
        </button>
        <button
          class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition"
          :class="
            view === 'menu'
              ? 'bg-lime text-ink-950'
              : 'text-slate-400 hover:text-slate-200'
          "
          @click="view = 'menu'"
        >
          <AppIcon name="grid" class="w-4 h-4" /> Menú semanal
        </button>
      </div>
    </div>

    <!-- LIST VIEW -->
    <div v-if="view === 'list'" class="space-y-2.5">
      <div
        v-for="d in week"
        :key="d.key"
        class="relative flex items-center w-full gap-4 p-4 overflow-hidden transition cursor-pointer surface group hover:border-white/10 hover:bg-ink-800"
        :class="!d.day?.enabled ? 'opacity-50' : ''"
        @click="d.day?.enabled ? openDay(d.date) : undefined"
      >
        <div class="flex flex-col items-center shrink-0">
          <span
            class="text-[10px] font-semibold uppercase tracking-wider text-slate-400"
            >{{ shortWeekday(d.date) }}</span
          >
          <span
            class="grid mt-1 text-base font-bold h-9 w-9 place-items-center rounded-xl"
            :class="
              d.today ? 'bg-lime text-ink-950' : 'bg-white/5 text-slate-300'
            "
            >{{ d.date.getDate() }}</span
          >
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <p
              v-if="d.day?.routineName"
              class="text-base font-semibold text-white truncate"
            >
              {{ d.day.routineName }}
            </p>
            <p v-else class="text-base font-semibold text-slate-500">
              Día libre
            </p>
            <span v-if="d.completed" class="chip shrink-0 bg-lime/15 text-lime">
              <AppIcon name="check" class="w-3 h-3" :stroke-width="3" />
            </span>
            <span
              v-if="d.day && !d.day.enabled"
              class="chip shrink-0 bg-white/5 text-slate-500"
              >Inactivo</span
            >
          </div>
          <p
            v-if="d.day?.description"
            class="mt-0.5 line-clamp-1 text-xs text-slate-400"
          >
            {{ d.day.description }}
          </p>
          <div class="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span
              v-if="exCount(d.day)"
              class="inline-flex items-center gap-1.5"
            >
              <AppIcon name="dumbbell" class="h-3.5 w-3.5" />
              {{ exCount(d.day) }} ejercicios
            </span>
            <span
              v-if="restCount(d.day)"
              class="inline-flex items-center gap-1.5"
            >
              <AppIcon name="clock" class="h-3.5 w-3.5" />
              {{ restCount(d.day) }}
            </span>
            <span
              v-if="d.day?.enabled && !d.day?.items.length"
              class="text-slate-500"
              >{{
                d.day?.routineName ? "Sin ejercicios" : "Añadir rutina"
              }}</span
            >
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button
            v-if="d.day && !d.day.enabled"
            class="px-3 py-2 text-xs btn-ghost text-lime hover:bg-lime/10"
            @click.stop="activateDay(d.day.id)"
          >
            <AppIcon name="check" class="w-4 h-4" :stroke-width="3" /> Activar
          </button>
          <span
            v-else
            class="text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-lime"
          >
            <AppIcon name="arrow-right" class="w-5 h-5" />
          </span>
        </div>

        <div
          class="absolute w-20 h-20 transition rounded-full opacity-0 -right-6 -top-6 blur-2xl group-hover:opacity-100"
          :class="d.today ? 'bg-lime/20' : 'bg-white/5'"
        />
      </div>
    </div>

    <!-- MENU VIEW -->
    <div v-else class="space-y-5">
      <div class="flex gap-1.5 overflow-x-auto no-scrollbar">
        <button
          v-for="d in week"
          :key="d.key"
          class="flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2.5 transition"
          :class="
            selectedKey === d.key
              ? 'border-lime/40 bg-lime/10 text-lime'
              : d.today
                ? 'border-lime/40 bg-lime/5 text-white'
                : 'border-white/5 bg-ink-850 text-slate-400 hover:text-slate-200'
          "
          @click="selectedKey = d.key"
        >
          <span class="text-[10px] font-semibold uppercase tracking-wider">{{
            shortWeekday(d.date)
          }}</span>
          <span
            class="grid text-sm font-bold rounded-lg h-7 w-7 place-items-center"
            :class="
              selectedKey === d.key ? 'bg-lime text-ink-950' : 'bg-white/5'
            "
            >{{ d.date.getDate() }}</span
          >
          <span v-if="d.completed" class="h-1.5 w-1.5 rounded-full bg-lime" />
          <span
            v-else-if="d.day?.items.length"
            class="h-1.5 w-1.5 rounded-full bg-slate-600"
          />
          <span v-else class="h-1.5 w-1.5 rounded-full bg-transparent" />
        </button>
      </div>

      <div v-if="selectedDay" class="p-5 surface animate-fade-up">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span
                class="text-xs font-semibold tracking-wider uppercase text-slate-400"
                >{{ selectedDay.dayName }}</span
              >
              <span
                v-if="selectedCell?.completed"
                class="chip bg-lime/15 text-lime"
              >
                <AppIcon name="check" class="w-3 h-3" :stroke-width="3" />
                Completado
              </span>
              <span
                v-if="!selectedDay.enabled"
                class="chip bg-white/5 text-slate-500"
                >Inactivo</span
              >
            </div>
            <h2 class="mt-1.5 text-xl font-bold text-white">
              {{ selectedDay.routineName || "Día libre" }}
            </h2>
            <p
              v-if="selectedDay.description"
              class="mt-1.5 text-sm text-slate-400"
            >
              {{ selectedDay.description }}
            </p>
          </div>
          <div class="flex flex-col items-end gap-2 shrink-0">
            <button
              v-if="!selectedDay.enabled"
              class="px-3 py-2 text-xs btn-ghost text-lime hover:bg-lime/10"
              @click="activateDay(selectedDay.id)"
            >
              <AppIcon name="check" class="w-4 h-4" :stroke-width="3" /> Activar
              día
            </button>
            <button
              v-else
              class="px-3 py-2 text-xs btn-primary"
              @click="
                navigateTo(
                  selectedDay.items.length
                    ? `/dia/${selectedDay.id}`
                    : `/dia/${selectedDay.id}?edit`,
                )
              "
            >
              {{ selectedDay.items.length ? "Abrir" : "Editar" }}
              <AppIcon name="arrow-right" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div v-if="selectedDay.items.length" class="mt-5 space-y-1.5">
          <div
            v-for="(item, idx) in selectedDay.items"
            :key="item.id"
            class="flex items-center gap-3 rounded-xl bg-white/[0.02] px-3 py-2.5"
          >
            <span
              class="grid w-6 h-6 font-mono text-xs font-bold rounded-md shrink-0 place-items-center bg-white/5 text-slate-400"
              >{{ idx + 1 }}</span
            >
            <template v-if="item.type === 'exercise'">
              <span
                class="flex-1 text-sm font-medium truncate text-slate-200"
                >{{ item.name }}</span
              >
              <span
                v-if="item.rest_between_sets"
                class="chip shrink-0 bg-sky-400/10 text-sky-300"
              >
                <AppIcon name="rest" class="w-3 h-3" />
                {{ formatDuration(item.rest_between_sets) }}
              </span>
              <MuscleBadge :group="item.muscle_group" />
            </template>
            <template v-else>
              <AppIcon name="rest" class="w-4 h-4 shrink-0 text-sky-400" />
              <span
                class="flex-1 text-sm font-medium truncate text-slate-200"
                >{{ item.label }}</span
              >
              <span class="chip shrink-0 bg-sky-400/10 text-sky-300">{{
                formatDuration(item.duration)
              }}</span>
            </template>
          </div>
        </div>

        <div
          v-else
          class="flex flex-col items-center gap-2 py-8 mt-5 text-center"
        >
          <AppIcon name="dumbbell" class="h-7 w-7 text-slate-600" />
          <p class="text-sm text-slate-400">Sin ejercicios este día.</p>
          <button
            class="px-3 py-2 mt-1 text-xs btn-ghost"
            @click="navigateTo(`/dia/${selectedDay.id}?edit`)"
            v-if="selectedDay.enabled"
          >
            <AppIcon name="plus" class="w-4 h-4" /> Añadir ejercicios
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  startOfWeek,
  addDays,
  shortWeekday,
  monthLabel,
  isToday,
  dateKey,
  localDayKey,
} from "~/composables/useCalendar";
import { formatDuration } from "~/composables/useTimer";
import type { Day } from "~/types";

const { days, sessions, updateDay } = useGymData();

const view = ref<"list" | "menu">(
  (sessionStorage.getItem("gymapp:weekView") as "list" | "menu") || "list",
);
watch(view, (v) => sessionStorage.setItem("gymapp:weekView", v));
const offset = ref(0);
const weekStart = computed(() =>
  startOfWeek(addDays(new Date(), offset.value * 7)),
);

interface WeekCell {
  key: string;
  date: Date;
  today: boolean;
  completed: boolean;
  day?: Day;
}
const week = computed<WeekCell[]>(() => {
  const start = weekStart.value;
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    const key = dateKey(date);
    return {
      key,
      date,
      today: isToday(date),
      completed: sessions.value.some(
        (s) => s.completed && localDayKey(s.date) === key,
      ),
      day: days.value.find((x) => x.dayName === weekdayName(date)),
    };
  });
});

const selectedKey = ref<string>("");
watch(
  week,
  (w) => {
    if (!w.some((d) => d.key === selectedKey.value)) {
      const today = w.find((d) => d.today);
      selectedKey.value = (today ?? w[0]).key;
    }
  },
  { immediate: true },
);

const selectedCell = computed(() =>
  week.value.find((d) => d.key === selectedKey.value),
);
const selectedDay = computed(() => selectedCell.value?.day);

function weekdayName(d: Date): string {
  return [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ][d.getDay() === 0 ? 6 : d.getDay() - 1];
}

function openDay(d: Date) {
  const day = days.value.find((x) => x.dayName === weekdayName(d));
  if (!day) return;
  const hasContent = day.routineName.trim() || day.items.length;
  navigateTo(hasContent ? `/dia/${day.id}` : `/dia/${day.id}?edit`);
}

function activateDay(id: string) {
  updateDay(id, { enabled: true });
}

function exCount(day?: Day) {
  return day?.items.filter((i) => i.type === "exercise").length || 0;
}
function restCount(day?: Day) {
  return day?.items.filter((i) => i.type === "rest").length || 0;
}
</script>
