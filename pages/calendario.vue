<template>
  <div class="space-y-6">
    <section class="flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-white">Racha</h1>
        <p class="mt-1 text-sm text-slate-400">Días completados</p>
      </div>
      <div class="flex items-center gap-1.5 rounded-full bg-ember/15 px-3 py-1.5 text-sm font-bold text-ember">
        <AppIcon name="flame" class="h-4 w-4" /> {{ streak }}
      </div>
    </section>

    <section class="grid grid-cols-3 gap-3">
      <div class="surface p-4">
        <p class="text-3xl font-bold text-lime">{{ streak }}</p>
        <p class="mt-1 text-xs text-slate-400">Racha actual</p>
      </div>
      <div class="surface p-4">
        <p class="text-3xl font-bold text-white">{{ total }}</p>
        <p class="mt-1 text-xs text-slate-400">Sesiones totales</p>
      </div>
      <div class="surface p-4">
        <p class="text-3xl font-bold text-white">{{ thisMonth }}</p>
        <p class="mt-1 text-xs text-slate-400">Este mes</p>
      </div>
    </section>

    <section class="surface p-5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button class="btn-ghost px-2.5 py-2" @click="monthOffset--">
            <AppIcon name="arrow-left" class="h-4 w-4" />
          </button>
          <h2 class="text-sm font-bold capitalize tracking-tight text-white">{{ monthTitle }}</h2>
          <button class="btn-ghost px-2.5 py-2" @click="monthOffset++">
            <AppIcon name="arrow-right" class="h-4 w-4" />
          </button>
        </div>
        <button
          v-if="monthOffset !== 0"
          class="text-xs font-medium text-slate-400 transition hover:text-lime"
          @click="monthOffset = 0"
        >Hoy</button>
      </div>

      <div class="mt-5 grid grid-cols-7 gap-1.5">
        <div
          v-for="h in WEEKDAY_HEADERS" :key="h"
          class="pb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500"
        >{{ h }}</div>

        <template v-for="cell in cells" :key="cell.key">
          <button
            v-if="cell.inMonth"
            class="relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm transition"
            :class="cellClass(cell)"
            @click="selectDay(cell)"
          >
            <span class="font-semibold" :class="cell.isToday ? 'text-ink-950' : completedMap.get(cell.key) ? 'text-ink-950' : 'text-slate-300'">{{ cell.date.getDate() }}</span>
            <span v-if="cell.isToday && !completedMap.get(cell.key)" class="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-lime" />
          </button>
          <div v-else class="aspect-square rounded-xl" />
        </template>
      </div>

      <div class="mt-5 flex items-center justify-center gap-5 text-[11px] text-slate-500">
        <span class="flex items-center gap-1.5">
          <span class="h-3 w-3 rounded-md bg-lime" /> Completado
        </span>
        <span class="flex items-center gap-1.5">
          <span class="h-3 w-3 rounded-md border border-lime/40 bg-lime/5" /> Hoy
        </span>
        <span class="flex items-center gap-1.5">
          <span class="h-3 w-3 rounded-md border border-white/5 bg-white/[0.02]" /> Sin actividad
        </span>
      </div>
    </section>

    <Transition name="fade">
      <section v-if="selectedInfo" class="surface animate-fade-up p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">{{ selectedInfo.weekday }}</p>
            <p class="mt-0.5 text-lg font-bold text-white">{{ selectedInfo.label }}</p>
          </div>
          <span v-if="selectedInfo.session" class="chip bg-lime/15 text-lime">
            <AppIcon name="check" class="h-3.5 w-3.5" :stroke-width="3" /> Completado
          </span>
        </div>

        <div v-if="selectedInfo.session" class="mt-4 flex items-center gap-3 rounded-xl bg-white/[0.02] px-3 py-3">
          <span class="grid h-9 w-9 place-items-center rounded-lg bg-lime/15 text-lime">
            <AppIcon name="dumbbell" class="h-4 w-4" />
          </span>
          <div class="flex-1">
            <p class="text-sm font-semibold text-white">{{ dayName(selectedInfo.session.dayId) }}</p>
            <p class="text-xs text-slate-500">{{ formatTime(selectedInfo.session.date) }}</p>
          </div>
          <div v-if="selectedInfo.session.durationMs > 0" class="text-right">
            <p class="text-xs text-slate-500">Duración</p>
            <p class="font-mono text-sm font-semibold text-lime">{{ formatDuration(Math.round(selectedInfo.session.durationMs / 1000)) }}</p>
          </div>
          <NuxtLink :to="`/dia/${selectedInfo.session.dayId}`" class="text-xs text-slate-400 transition hover:text-lime">Ver día</NuxtLink>
        </div>
        <p v-else class="mt-4 text-sm text-slate-400">Sin sesión registrada este día.</p>
      </section>
    </Transition>

    <section>
      <h2 class="label mb-2">Sesiones recientes</h2>
      <div v-if="recent.length" class="space-y-2">
        <div v-for="s in recent" :key="s.id" class="surface flex items-center gap-3 p-3.5">
          <span class="grid h-9 w-9 place-items-center rounded-lg bg-lime/15 text-lime">
            <AppIcon name="check" class="h-4 w-4" :stroke-width="3" />
          </span>
          <div class="flex-1">
            <p class="text-sm font-semibold text-white">{{ dayName(s.dayId) }}</p>
            <p class="text-xs text-slate-500">{{ formatDate(s.date) }}</p>
          </div>
          <span v-if="s.durationMs > 0" class="chip bg-white/5 text-slate-300">
            <AppIcon name="timer" class="h-3.5 w-3.5" />
            <b class="font-mono text-slate-200">{{ formatDuration(Math.round(s.durationMs / 1000)) }}</b>
          </span>
          <NuxtLink :to="`/dia/${s.dayId}`" class="text-xs text-slate-400 transition hover:text-lime">Ver día</NuxtLink>
        </div>
      </div>
      <div v-else class="surface flex flex-col items-center gap-2 px-4 py-10 text-center">
        <AppIcon name="flame" class="h-8 w-8 text-slate-600" />
        <p class="text-sm text-slate-400">Aún no has completado ninguna sesión.</p>
        <p class="text-xs text-slate-500">Corre una rutina para empezar tu racha.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  currentStreak, dateKey, isToday, localDayKey,
  monthGrid, startOfMonth, addMonths, MONTH_NAMES, WEEKDAY_HEADERS
} from '~/composables/useCalendar'
import { formatDuration } from '~/composables/useTimer'
import type { MonthCell } from '~/composables/useCalendar'
import type { RunSession } from '~/types'

const { sessions, days } = useGymData()

const completed = computed(() => sessions.value.filter((s) => s.completed))

const activeDayNames = computed(() =>
  days.value
    .filter((d) => d.enabled && d.items.length > 0)
    .map((d) => d.dayName)
)

const streak = computed(() => currentStreak(completed.value, activeDayNames.value))
const total = computed(() => completed.value.length)
const thisMonth = computed(() => {
  const m = new Date().getMonth()
  return completed.value.filter((s) => new Date(s.date).getMonth() === m).length
})

const monthOffset = ref(0)
const cursor = computed(() => addMonths(startOfMonth(new Date()), monthOffset.value))
const monthTitle = computed(() => {
  const c = cursor.value
  return `${MONTH_NAMES[c.getMonth()]} ${c.getFullYear()}`
})

const completedMap = computed(() => {
  const map = new Map<string, RunSession>()
  for (const s of completed.value) {
    map.set(localDayKey(s.date), s)
  }
  return map
})

const cells = computed(() => monthGrid(cursor.value.getFullYear(), cursor.value.getMonth()))

function cellClass(cell: MonthCell) {
  if (!cell.inMonth) return ''
  const session = completedMap.value.get(cell.key)
  if (cell.isToday && session) return 'border-lime bg-lime'
  if (cell.isToday) return 'border-lime/40 bg-lime/5'
  if (session) return 'border-lime/30 bg-lime/15 hover:bg-lime/25'
  return 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/10 hover:bg-white/5'
}

const selectedKey = ref<string | null>(null)

interface SelectedInfo {
  weekday: string
  label: string
  session: RunSession | null
}
const selectedInfo = computed<SelectedInfo | null>(() => {
  if (!selectedKey.value) return null
  const cell = cells.value.find((c) => c.key === selectedKey.value)
  if (!cell || !cell.inMonth) return null
  const session = completedMap.value.get(cell.key) ?? null
  const weekdayName = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][cell.date.getDay() === 0 ? 6 : cell.date.getDay() - 1]
  return {
    weekday: weekdayName,
    label: cell.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }),
    session
  }
})

function selectDay(cell: MonthCell) {
  if (!cell.inMonth) return
  selectedKey.value = selectedKey.value === cell.key ? null : cell.key
}

const recent = computed(() =>
  [...completed.value].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
)

function dayName(dayId: string) {
  const d = days.value.find((x) => x.id === dayId)
  return d?.routineName || d?.dayName || 'Sesión'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(6px); }
</style>
