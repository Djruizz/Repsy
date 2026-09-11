# Plan Fase 2 — Múltiples rutinas por día

> **Estado:** aprobado conceptualmente, **sin implementar**. Este documento preserva el contexto
> y las decisiones tomadas en caso de perder la sesión de trabajo. Léelo completo antes de empezar.
> Fecha de redacción: 2026-09-10.

## Contexto: lo que ya existe (Fase 1 implementada)

- **Modelo actual**: `GymData { days: Day[7], routines: Day[], sessions: RunSession[] }`.
  Los 7 días son fijos (`Lunes..Domingo`, `REQUIRED_DAYS` en `useGymData.ts`).
  `routines` son **rutinas libres** con convención `dayName: ''`.
- `getDay(id)` resuelve **días y rutinas libres** → todo el CRUD de ítems
  (`addItem/updateItem/removeItem/moveItem`) funciona para ambos sin cambios.
- Semana/racha/calendario cuentan **por fecha**: una sesión de rutina libre completada
  marca la celda del día y suma racha (decisión del usuario).
- Eliminar una rutina libre **borra también sus sesiones** (`removeRoutine`).
- Runner (`pages/correr/[id].vue`):
  - Cualquier rutina de día se puede correr en otro día ("recuperación") con aviso
    confirmable (`RunNotTodayState` + `overrideNotToday`). Las libres corren sin aviso (`isFreeRoutine`).
  - Al completar la rutina: **auto-finish a los 15s cancelable** (`autoCountdown`, `RunCompleteState`
    con `autoSeconds`/`autoActive` + emit `cancel`); salir con la rutina completa también finaliza
    (salvo cuenta cancelada).
  - **Rescate**: sesión incompleta de otro día con toda la rutina hecha → `rescueSession`
    (`completed: true`, `date = startedAt`, duración desde `lastActiveAt`); a medias → se descarta
    (`resolveStaleSessions` en `readFromStorage` + `initSession` en el runner para el caso
    app abierta pasada la medianoche).
  - Cada interacción llama `touch()` (sella `session.lastActiveAt`).
  - Rutinas vacías nunca crean sesión.
- Sync (`useSync.ts`): LWW del doc completo en Firestore `users/{uid}` por `updatedAt`;
  `ready` solo tras pull exitoso; retries de pull/push cada 30s; ownership en `localStorage`
  `gymapp:syncUid`; logout → `resetAll()` + `clearDeviceOwnership()` (con confirmación si hay
  errores de sync).
- Firebase es **opcional** (`NUXT_PUBLIC_FIREBASE_*`); sin vars el plugin provee `null` y todo
  degrada a local (`useFirebase` devuelve tipos nullable).

## Objetivo Fase 2

Un día puede tener **N rutinas** (cardio AM + pesas PM, alternativas A/B). Para lograrlo se
unifica el modelo: `days[7] + routines[]` → **una sola lista plana `routines: Routine[]`**
donde "múltiples por día" = varias rutinas con el mismo `dayName`, y "libre" = `dayName: null`.

## Modelo de datos destino

```ts
export interface Routine {
  id: string
  dayName: string | null   // null = libre; 'Lunes'..'Domingo' = asignada a ese día
  routineName: string
  description: string
  warmup: string
  items: RoutineItem[]
  enabled: boolean
  order: number            // orden dentro del día (libres: orden en el listado)
}

export interface GymData {
  version: 2               // DATA_VERSION = 2
  updatedAt?: string
  routines: Routine[]
  sessions: RunSession[]   // dayId pasa a referenciar siempre un Routine.id (ya lo hace)
}
```

- `days[7]` **desaparece** como entidad. La semana se deriva: rutinas agrupadas por `dayName`.
  Los 7 días siguen existiendo **virtualmente** para hidratación (celdas vacías) — mantener
  `REQUIRED_DAYS` como lista de nombres, no de entidades.

## Rutas (decisión ya tomada — no re-abrir)

| Ruta | Significado |
|------|-------------|
| `/dia/{slug}` (p. ej. `/dia/lunes`) | El día: listado de sus rutinas + crear + reordenar |
| `/rutina/{id}` | Detalle/edición/ejecución de una rutina concreta (de día o libre) |
| `/correr/{id}` | Runner — **sin cambios** (ya opera por id de rutina) |
| `/rutinas` | Listado de libres — sin cambios mayores |

- La decisión (2026-09-10) fue **no** renombrar nada antes de esta fase; las 12 referencias
  actuales a `/dia/{id}` (grep: AppHeader no, rutinas.vue ×2, index.vue ×2, dia/[id].vue,
  correr/[id].vue ×3, RecentSessions, SelectedDayInfo, day/Header back) se migran **aquí una sola vez**.
- El contenido de `pages/dia/[id].vue` se extrae a un componente compartido
  (p. ej. `components/day/Detail.vue`) reutilizado por `pages/rutina/[id].vue`.

## Migración v1 → v2

1. **localStorage**: `readFromStorage` detecta formato v1 (`days` presente) → construye
   `routines` desde `days` (cada día → rutina con su `dayName`, `order: 0`) + las libres
   (`dayName: ''` → `null`). Stampa `version: 2` y persiste.
2. **Firestore**: `applyRemote` normaliza igual (doc v1 → v2 en memoria; el siguiente push
   escribe v2). No hace falta migración del servidor.
3. **Export/import**: `importData` acepta ambos formatos (v1 y v2); `exportData` siempre v2.
   Merge por `id` de rutina. Los `{ ok, ignoredDays }` se mantienen.
4. **Sin rollback**: un downgrade de la app perdería las rutinas (v2 lee `routines`, v1 lo ignora).
   Aceptado.

## Áreas impactadas (checklist de implementación)

- [ ] `types/index.ts` — `Routine`, `GymData` v2.
- [ ] `composables/useGymData.ts` — migración v1→v2; hidratación con `REQUIRED_DAYS` virtual;
      CRUD de rutinas (`addRoutine(dayName|null)`, `removeRoutine` (ya borra sesiones),
      `moveRoutine`/reorder); `getDay(id)` → `getRoutine(id)`; week helpers;
      `sessionComplete`/`getWeightHistory`/`getAllExercises` iteran solo `routines`;
      `importData`/`applyRemote`/`exportData`.
- [ ] `composables/useCalendar.ts` — `currentStreak`: `activeDayNames` deriva de rutinas
      con `dayName !== null && enabled && items.length` (el resto de la lógica no cambia).
- [ ] `pages/index.vue` — celda de semana agrega las N rutinas del weekday; navegación a
      `/dia/{slug}`; "Completado" sigue por fecha.
- [ ] `pages/dia/[slug].vue` (nueva; sustituye a `dia/[id].vue`) — listado de rutinas del día,
      crear, reordenar, navegar a `/rutina/{id}`.
- [ ] `pages/rutina/[id].vue` (nueva) + `components/day/Detail.vue` (extraído de `dia/[id].vue`).
- [ ] `pages/rutinas.vue` — ya lista libres; adaptar a `dayName: null`.
- [ ] `pages/correr/[id].vue` — sin cambios mayores; `isFreeRoutine` pasa a `dayName === null`.
- [ ] `pages/calendario.vue` — `resolveDayName` sobre `routines` (lookup único).
- [ ] `components/week/DayRow.vue` + `MenuDayDetail.vue` — celda multi-rutina.
- [ ] `components/streak/RecentSessions.vue` + `SelectedDayInfo.vue` — "Ver día" → `/rutina/{id}`.
- [ ] `AGENTS.md` — actualizar modelo, rutas y convenciones.

## Decisiones ya tomadas (NO re-abrir sin pedir al usuario)

1. Borrar rutina → **borrar sus sesiones**.
2. Sesiones de rutinas libres **cuentan como día entrenado** (racha/semana por fecha).
3. Runner de otro día: **híbrido con aviso** confirmable (no libre ni bloqueado).
4. Auto-finish **15s cancelable**; salir con rutina completa finaliza (salvo cancelación).
5. Rescate de sesiones olvidadas completas; descarte de las parciales.
6. Naming de rutas: `/dia/{slug}` + `/rutina/{id}` (ver tabla).
7. Sync LWW doc completo por `updatedAt` (sin merge fino).

## Preguntas abiertas para resolver AL INICIO de la Fase 2

- ¿"Día completado" en la celda = **al menos una** rutina completada ese día (por fecha) o **todas** las del día?
- ¿Reordenar rutinas dentro del día con flechas (como los items) o drag?
- ¿`enabled` por rutina, por día, o ambos?
- Semántica exacta del merge en import v2 (¿por id, por dayName+nombre?).

## Orden de implementación sugerido

1. `types` + migración/hidratación en `useGymData` (todo lo demás sigue compilando contra
   `getRoutine`/`routines`).
2. Páginas: extraer `Detail.vue` → `rutina/[id].vue` → nueva `dia/[slug].vue` → ajustar navegación
   (las 12 referencias).
3. Semana (`index.vue` + `week/*`) y streak.
4. Calendario + import/export/sync verificación.
5. `AGENTS.md` + `npm run typecheck` + `npm run build` + smoke completo.

## Verificación (smoke)

- Datos v1 reales migran sin pérdida (días → rutinas con su dayName; libres → `dayName: null`).
- Día con 2 rutinas: correr ambas el mismo día (`alreadyRunToday` es por rutina);
  celda/semana/racha correctas.
- Export v2 → import v2 (replace y merge) round-trip.
- Sync entre 2 dispositivos con doc v1 (pull normaliza, push escribe v2).
- Rutinas libres: crear/correr/eliminar (con sus sesiones) desde `/rutinas`.
