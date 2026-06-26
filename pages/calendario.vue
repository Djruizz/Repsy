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

    <StreakStats :streak="streak" :total="total" :this-month="thisMonth" />

    <StreakMonthCalendar
      v-model:month-offset="monthOffset"
      :cells="cells"
      :month-title="monthTitle"
      :completed-keys="completedKeys"
      @select="selectDay"
    />

    <Transition name="fade">
      <StreakSelectedDayInfo :info="selectedInfo" />
    </Transition>

    <StreakRecentSessions :entries="recentEntries" />
  </div>
</template>

<script setup lang="ts">
import {
  currentStreak, dateKey, localDayKey,
  monthGrid, startOfMonth, addMonths, MONTH_NAMES, weekdayName,
  type MonthCell
} from '~/composables/useCalendar'
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

const completedKeys = computed(() => {
  const set = new Set<string>()
  for (const s of completed.value) set.add(localDayKey(s.date))
  return set
})

const cells = computed(() => monthGrid(cursor.value.getFullYear(), cursor.value.getMonth()))

const selectedKey = ref<string | null>(null)

interface SelectedInfo {
  weekday: string
  label: string
  session: RunSession | null
  dayLabel: string
}

const selectedInfo = computed<SelectedInfo | null>(() => {
  if (!selectedKey.value) return null
  const cell = cells.value.find((c) => c.key === selectedKey.value)
  if (!cell || !cell.inMonth) return null
  const session = completedMap.value.get(cell.key) ?? null
  const weekday = weekdayName(cell.date)
  const dayLabel = session ? resolveDayName(session.dayId) : ''
  return {
    weekday,
    label: cell.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }),
    session,
    dayLabel,
  }
})

function selectDay(cell: MonthCell) {
  if (!cell.inMonth) return
  selectedKey.value = selectedKey.value === cell.key ? null : cell.key
}

function resolveDayName(dayId: string): string {
  const d = days.value.find((x) => x.id === dayId)
  return d?.routineName || d?.dayName || 'Sesión'
}

interface RecentEntry {
  id: string
  dayId: string
  dayLabel: string
  date: string
  durationMs: number
}

const recentEntries = computed<RecentEntry[]>(() =>
  [...completed.value]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)
    .map((s) => ({
      id: s.id,
      dayId: s.dayId,
      dayLabel: resolveDayName(s.dayId),
      date: s.date,
      durationMs: s.durationMs,
    }))
)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(6px); }
</style>
