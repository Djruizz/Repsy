# AGENTS.md

Nuxt 3 SPA (PWA) for tracking gym routines. Spanish UI. Local-first: all state lives in `localStorage`; **optional** Firebase cloud sync (auth + Firestore) activated by env vars — without them the app works fully offline/local.

## Commands

- `npm run dev` — dev server
- `npm run build` — production build (emits an empty `server` chunk warning; expected with `ssr: false`)
- `npm run generate` / `npm run preview` — static build / preview
- `npm run typecheck` — `nuxt typecheck` (vue-tsc). **Run this after non-trivial changes.**
- **No lint, no test scripts exist.** Don't try to run them.

`tsconfig.json` extends `.nuxt/tsconfig.json`, so a fresh clone needs `npm install` (runs `nuxt prepare` via `postinstall`) before typecheck works.

## Framework quirks

- `ssr: false` + `experimental: { appManifest: false }` — pure SPA. Don't add server-side logic.
- **Do not delete `server.shim.ts`** or the `vite:extendConfig` hook in `nuxt.config.ts`. It's a dev-only shim that satisfies `@nuxt/vite-builder`'s `resolveServerEntry` when `ssr: false`. Removing it breaks the build.
- PWA via `@vite-pwa/nuxt` with `registerType: 'autoUpdate'`. `devOptions.enabled: false` — PWA is only active in build/preview, not `npm run dev`.

## Firebase / cloud sync

- `plugins/firebase.client.ts` initializes Firebase from `NUXT_PUBLIC_FIREBASE_*` runtime config. If any var is missing, it provides `null` for `$firebaseApp`/`$auth`/`$db` and the app degrades to local-only — guard for null in consumers (`useFirebase` returns nullable types).
- `composables/useAuth.ts` — email/password auth with Spanish error messages; module-level `user`/`authReady` refs.
- `composables/useSync.ts` — LWW sync of the whole `GymData` doc to Firestore `users/{uid}`, keyed by `updatedAt`. Device ownership is cached in `localStorage` under `gymapp:syncUid`. Pull/push have 30s retry timers; `ready` only becomes true after a successful pull (never push possibly-stale local data over an unknown remote). `clearDeviceOwnership()` is called on logout (together with `resetAll()`) to wipe the account's local data.
- Sync errors surface as an ember "Sync" chip in `AppHeader`.

## Styling — non-obvious

Tailwind is extended with custom tokens in `tailwind.config.js` and component classes in `assets/css/main.css`. These are used everywhere and look like plugins but aren't:

- **Custom color scales**: `ink-{400..950}` (dark blues, the app background scale), `lime` (primary accent, default `#c6f135`), `ember` (warning/danger). Not Tailwind defaults — don't substitute `slate`/`gray`.
- **Component classes** (defined in `@layer components` in `main.css`): `.surface`, `.surface-raised`, `.chip`, `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.input`, `.label`. Prefer these over re-deriving with raw utilities.
- Custom animations: `animate-fade-up`, `animate-pulse-ring`.

## Architecture

- `app.vue` → `NuxtLayout` (only `default.vue`: `AppHeader` + `<slot/>` + `AppTabbar`) → `NuxtPage`.
- **State**: `composables/useGymData.ts` holds a singleton `ref<GymData>` synced to `localStorage` under `gymapp:data`. SPA-only — it freely touches `localStorage` without guards. The deep `watch` that persists (and stamps `updatedAt`) is initialized once via a module-level `watchInitialized` flag; its `touchGuard` prevents the recursive re-trigger of the sync-flush watcher from double-writing storage. On startup, `readFromStorage` resolves stale sessions (incomplete, started another day): fully-done ones are **rescued** (`completed: true`, `date = startedAt` so they count for the day they happened, `durationMs` from `lastActiveAt`), the rest are purged. `isSessionComplete`/`rescueSession` expose that logic.
- **Data model** (`types/index.ts`): `GymData { days: Day[7], routines: Day[], sessions: RunSession[] }`. The 7 days are fixed (`Lunes`..`Domingo`) and always present; `importData`/`readFromStorage` re-hydrate any missing day (days with unknown `dayName` are dropped and reported by `importData`, which returns `{ ok, ignoredDays }`). Merge-mode import preserves local day `id`s (remapping incoming sessions' `dayId`) so existing history stays linked; free routines merge by `id`. `routines` holds **free routines** (no fixed weekday, convention `dayName: ''`) — runnable any day without the not-today warning; `getDay(id)` resolves both days and routines, so item CRUD works for both. `RoutineItem` is a discriminated union (`Exercise | Rest`) on `item.type`.
- **Composables**: `useGymData` (CRUD + sessions + weight history + import/export), `useTimer` (`useStopwatch`, `useCountdown` — also exposes `targetMs` —, `formatTime`, `formatDuration`), `useCalendar` (Monday-based week helpers, `monthGrid`, `currentStreak`, `weekdayName`; use `parseDateKey` for local "YYYY-MM-DD" keys — `new Date()` parses them as UTC), `useSoundCue` (WebAudio finish cue, muted flag under `gymapp:soundMuted`), `useExerciseCatalog` (search over `assets/exercises_es.json`).

## Pages

- `index.vue` — week view (list / menu toggle, persisted in `sessionStorage` under `gymapp:weekView`)
- `rutinas.vue` — free-routine list (create / run / delete; deleting also removes its sessions)
- `calendario.vue` — streak + month calendar
- `progreso.vue` — per-exercise weight history chart
- `dia/[id].vue` — day detail + edit mode (toggled via `?edit` query). Owns the `BaseModal` with `ExerciseForm` / `RestForm`.
- `correr/[id].vue` — routine runner. Owns all timer state (stopwatch + 3 countdowns + the auto-finish countdown) and session mutation; its sub-components in `components/run/` are presentational (props/emits only). Keep that split. Every user interaction calls `touch()` (stamps `session.lastActiveAt`) so auto-finished/rescued sessions get a real duration. When the routine completes, the session auto-finishes after a 15s cancelable countdown (`RunCompleteState` shows it); leaving the runner with the routine complete also finishes it unless the countdown was canceled. Empty routines never create a session. Routines can be run on any weekday (make-up workouts): on a non-matching day the runner shows `RunNotTodayState` with a run-anyway confirmation (`overrideNotToday` in the page); week/streak still count by the date the session happened, not the routine's weekday.

## Components — Nuxt auto-import prefixes

Components live in subdirectories of `components/`; Nuxt prepends the directory name as a PascalCase prefix:

- `components/ui/` → `<Ui*>` (`UiEmptyState`, `UiStatCard`, `UiCountdownRing`)
- `components/routine/` → `<Routine*>`
- `components/week/` → `<Week*>`
- `components/progress/` → `<Progress*>`
- `components/streak/` → `<Streak*>`
- `components/day/` → `<Day*>`
- `components/run/` → `<Run*>`
- Root-level (`AppHeader`, `AppTabbar`, `AppIcon`, `BaseModal`, `MuscleBadge`, `ExerciseForm`, `RestForm`, `ImportDialog`, `AuthDialog`) have no prefix.

**Never import components manually** — Nuxt auto-imports them. Only `composables/*` and `types/*` need explicit imports.

`AppIcon` is a custom SVG system: a hardcoded `paths` record in `components/AppIcon.vue`. Icon names passed to `:name` must exist in that map (e.g. `dumbbell`, `rest`, `timer`, `flame`, `arrow-left`). Add new icons there, don't introduce an icon library.

## Conventions

- Spanish for all user-facing strings; `lang="es"` is set in `nuxt.config.ts`.
- Week starts **Monday**, not Sunday — `startOfWeek`, `weekdayName`, `shortWeekday`, and the streak logic all assume this.
- Shared cross-component types go in `types/index.ts` (e.g. `WeekCell` is used by `pages/index.vue` and `components/week/*`).
- Prefer passing data via props and communicating via emits; keep business logic in pages/composables, not in presentational components.

## Roadmap

- **Fase 2 — multiple routines per day**: full plan, closed decisions and open questions live in `docs/PLAN-FASE-2.md` (Spanish). Read it before touching the data model or routes — route naming (`/dia/{slug}` + `/rutina/{id}`) is already decided there.
