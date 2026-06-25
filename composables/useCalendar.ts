export function startOfWeek(d: Date): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export function addDays(d: Date, n: number): Date {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b);
}

export function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

export function weekDays(d: Date): Date[] {
  const start = startOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function shortWeekday(d: Date): string {
  return ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][
    d.getDay() === 0 ? 6 : d.getDay() - 1
  ];
}

export function monthLabel(d: Date): string {
  return d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

export function startOfMonth(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), 1);
  return date;
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export interface MonthCell {
  key: string;
  date: Date;
  inMonth: boolean;
  isToday: boolean;
}

export function monthGrid(year: number, month: number): MonthCell[] {
  const first = new Date(year, month, 1);
  const gridStart = startOfWeek(first);
  const cells: MonthCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(gridStart, i);
    cells.push({
      key: dateKey(d),
      date: d,
      inMonth: d.getMonth() === month,
      isToday: isToday(d),
    });
  }
  return cells;
}

export const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const WEEKDAY_HEADERS = [
  "Lun",
  "Mar",
  "Mié",
  "Jue",
  "Vie",
  "Sáb",
  "Dom",
];

export interface StreakDay {
  key: string;
  date: Date;
  completed: boolean;
  isToday: boolean;
}

export function streakGrid(
  sessions: { date: string; completed: boolean }[],
  weeks = 12,
): StreakDay[][] {
  const completedSet = new Set(
    sessions.filter((s) => s.completed).map((s) => s.date.slice(0, 10)),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = startOfWeek(today);
  const start = addDays(end, -(weeks - 1) * 7);
  const cols: StreakDay[][] = [];
  for (let w = 0; w < weeks; w++) {
    const colStart = addDays(start, w * 7);
    const col: StreakDay[] = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(colStart, i);
      const key = dateKey(d);
      col.push({
        key,
        date: d,
        completed: completedSet.has(key),
        isToday: isToday(d),
      });
    }
    cols.push(col);
  }
  return cols;
}

const WEEKDAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export function weekdayName(d: Date): string {
  return WEEKDAY_NAMES[d.getDay() === 0 ? 6 : d.getDay() - 1];
}

export function currentStreak(
  sessions: { date: string; completed: boolean }[],
  activeDayNames: string[],
): number {
  const completedSet = new Set(
    sessions.filter((s) => s.completed).map((s) => s.date.slice(0, 10)),
  );
  const activeSet = new Set(activeDayNames);

  if (activeSet.size === 0) return 0;

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // If today is an active day and not yet completed, don't break the streak yet
  const todayActive = activeSet.has(weekdayName(cursor));
  const todayDone = completedSet.has(dateKey(cursor));

  if (todayActive && !todayDone) {
    // Don't count today, start checking from yesterday
  } else if (todayDone) {
    streak++;
    cursor = addDays(cursor, -1);
  } else {
    // Today is not active and not done — start from yesterday
    cursor = addDays(cursor, -1);
  }

  while (true) {
    const name = weekdayName(cursor);
    const key = dateKey(cursor);
    const isActive = activeSet.has(name);

    if (completedSet.has(key)) {
      streak++;
      cursor = addDays(cursor, -1);
    } else if (!isActive) {
      // Skip empty/inactive days — they don't break the streak
      cursor = addDays(cursor, -1);
    } else {
      // Active day not completed — streak breaks
      break;
    }
  }
  return streak;
}
