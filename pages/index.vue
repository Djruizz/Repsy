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

    <WeekViewToggle v-model="view" />

    <!-- LIST VIEW -->
    <div v-if="view === 'list'" class="space-y-2.5">
      <WeekDayRow
        v-for="d in week"
        :key="d.key"
        :cell="d"
        @open="openDay"
        @activate="activateDay"
      />
    </div>

    <!-- MENU VIEW -->
    <div v-else class="space-y-5">
      <WeekMenuSelector
        :cells="week"
        v-model:selected-key="selectedKey"
      />

      <WeekMenuDayDetail
        :cell="selectedCell"
        @activate="activateDay"
        @navigate="onNavigate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  startOfWeek,
  addDays,
  monthLabel,
  isToday,
  dateKey,
  localDayKey,
  weekdayName,
} from "~/composables/useCalendar";
import type { Day, WeekCell } from "~/types";

const { days, sessions, updateDay } = useGymData();

const view = ref<"list" | "menu">(
  (sessionStorage.getItem("gymapp:weekView") as "list" | "menu") || "list",
);
watch(view, (v) => sessionStorage.setItem("gymapp:weekView", v));
const offset = ref(0);
const weekStart = computed(() =>
  startOfWeek(addDays(new Date(), offset.value * 7)),
);

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

function openDay(d: Date) {
  const day = days.value.find((x) => x.dayName === weekdayName(d));
  if (!day) return;
  const hasContent = day.routineName.trim() || day.items.length;
  navigateTo(hasContent ? `/dia/${day.id}` : `/dia/${day.id}?edit`);
}

function activateDay(id: string) {
  updateDay(id, { enabled: true });
}

function onNavigate(id: string, hasItems: boolean) {
  navigateTo(hasItems ? `/dia/${id}` : `/dia/${id}?edit`);
}
</script>
