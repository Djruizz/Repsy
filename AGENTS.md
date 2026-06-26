# AGENTS.md

Nuxt 3 SPA (PWA) for tracking gym routines. Spanish UI. No backend, no DB, no env vars — all state lives in `localStorage`.

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

## Styling — non-obvious

Tailwind is extended with custom tokens in `tailwind.config.js` and component classes in `assets/css/main.css`. These are used everywhere and look like plugins but aren't:

- **Custom color scales**: `ink-{400..950}` (dark blues, the app background scale), `lime` (primary accent, default `#c6f135`), `ember` (warning/danger). Not Tailwind defaults — don't substitute `slate`/`gray`.
- **Component classes** (defined in `@layer components` in `main.css`): `.surface`, `.surface-raised`, `.chip`, `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.input`, `.label`. Prefer these over re-deriving with raw utilities.
- Custom animations: `animate-fade-up`, `animate-pulse-ring`.

## Architecture

- `app.vue` → `NuxtLayout` (only `default.vue`: `AppHeader` + `<slot/>` + `AppTabbar`) → `NuxtPage`.
- **State**: `composables/useGymData.ts` holds a singleton `ref<GymData>` synced to `localStorage` under `gymapp:data`. SPA-only — it freely touches `localStorage` without guards. The deep `watch` that persists is initialized once via a module-level `watchInitialized` flag.
- **Data model** (`types/index.ts`): `GymData { days: Day[7], sessions: RunSession[] }`. The 7 days are fixed (`Lunes`..`Domingo`) and always present; `importData`/`readFromStorage` re-hydrate any missing day. `RoutineItem` is a discriminated union (`Exercise | Rest`) on `item.type`.
- **Composables**: `useGymData` (CRUD + sessions + weight history + import/export), `useTimer` (`useStopwatch`, `useCountdown`, `formatTime`, `formatDuration`), `useCalendar` (Monday-based week helpers, `monthGrid`, `currentStreak`, `weekdayName`).

## Pages

- `index.vue` — week view (list / menu toggle, persisted in `sessionStorage` under `gymapp:weekView`)
- `calendario.vue` — streak + month calendar
- `progreso.vue` — per-exercise weight history chart
- `dia/[id].vue` — day detail + edit mode (toggled via `?edit` query). Owns the `BaseModal` with `ExerciseForm` / `RestForm`.
- `correr/[id].vue` — routine runner. Owns all timer state (stopwatch + 3 countdowns) and session mutation; its sub-components in `components/run/` are presentational (props/emits only). Keep that split.

## Components — Nuxt auto-import prefixes

Components live in subdirectories of `components/`; Nuxt prepends the directory name as a PascalCase prefix:

- `components/ui/` → `<Ui*>` (`UiEmptyState`, `UiStatCard`, `UiCountdownRing`)
- `components/routine/` → `<Routine*>`
- `components/week/` → `<Week*>`
- `components/progress/` → `<Progress*>`
- `components/streak/` → `<Streak*>`
- `components/day/` → `<Day*>`
- `components/run/` → `<Run*>`
- Root-level (`AppHeader`, `AppTabbar`, `AppIcon`, `BaseModal`, `MuscleBadge`, `ExerciseForm`, `RestForm`, `ImportDialog`) have no prefix.

**Never import components manually** — Nuxt auto-imports them. Only `composables/*` and `types/*` need explicit imports.

`AppIcon` is a custom SVG system: a hardcoded `paths` record in `components/AppIcon.vue`. Icon names passed to `:name` must exist in that map (e.g. `dumbbell`, `rest`, `timer`, `flame`, `arrow-left`). Add new icons there, don't introduce an icon library.

## Conventions

- Spanish for all user-facing strings; `lang="es"` is set in `nuxt.config.ts`.
- Week starts **Monday**, not Sunday — `startOfWeek`, `weekdayName`, `shortWeekday`, and the streak logic all assume this.
- Shared cross-component types go in `types/index.ts` (e.g. `WeekCell` is used by `pages/index.vue` and `components/week/*`).
- Prefer passing data via props and communicating via emits; keep business logic in pages/composables, not in presentational components.
