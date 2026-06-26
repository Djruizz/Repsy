
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  AppHeader: typeof import("../../components/AppHeader.vue")['default']
  AppIcon: typeof import("../../components/AppIcon.vue")['default']
  AppTabbar: typeof import("../../components/AppTabbar.vue")['default']
  BaseModal: typeof import("../../components/BaseModal.vue")['default']
  ExerciseForm: typeof import("../../components/ExerciseForm.vue")['default']
  ImportDialog: typeof import("../../components/ImportDialog.vue")['default']
  MuscleBadge: typeof import("../../components/MuscleBadge.vue")['default']
  RestForm: typeof import("../../components/RestForm.vue")['default']
  DayEditRoutine: typeof import("../../components/day/EditRoutine.vue")['default']
  DayEditSummary: typeof import("../../components/day/EditSummary.vue")['default']
  DayHeader: typeof import("../../components/day/Header.vue")['default']
  DayNotFoundState: typeof import("../../components/day/NotFoundState.vue")['default']
  DayRoutineList: typeof import("../../components/day/RoutineList.vue")['default']
  DaySummary: typeof import("../../components/day/Summary.vue")['default']
  DayWarmup: typeof import("../../components/day/Warmup.vue")['default']
  ProgressChart: typeof import("../../components/progress/Chart.vue")['default']
  ProgressExerciseSelector: typeof import("../../components/progress/ExerciseSelector.vue")['default']
  ProgressHistory: typeof import("../../components/progress/History.vue")['default']
  ProgressStats: typeof import("../../components/progress/Stats.vue")['default']
  RoutineItemCard: typeof import("../../components/routine/ItemCard.vue")['default']
  RoutineItemEditControls: typeof import("../../components/routine/ItemEditControls.vue")['default']
  RunAlreadyDoneState: typeof import("../../components/run/AlreadyDoneState.vue")['default']
  RunCompleteState: typeof import("../../components/run/CompleteState.vue")['default']
  RunExerciseItem: typeof import("../../components/run/ExerciseItem.vue")['default']
  RunHeader: typeof import("../../components/run/Header.vue")['default']
  RunNotFoundState: typeof import("../../components/run/NotFoundState.vue")['default']
  RunNotTodayState: typeof import("../../components/run/NotTodayState.vue")['default']
  RunProgressBar: typeof import("../../components/run/ProgressBar.vue")['default']
  RunRestItem: typeof import("../../components/run/RestItem.vue")['default']
  RunRoutineProgress: typeof import("../../components/run/RoutineProgress.vue")['default']
  RunSetRestOverlay: typeof import("../../components/run/SetRestOverlay.vue")['default']
  StreakMonthCalendar: typeof import("../../components/streak/MonthCalendar.vue")['default']
  StreakRecentSessions: typeof import("../../components/streak/RecentSessions.vue")['default']
  StreakSelectedDayInfo: typeof import("../../components/streak/SelectedDayInfo.vue")['default']
  StreakStats: typeof import("../../components/streak/Stats.vue")['default']
  UiCountdownRing: typeof import("../../components/ui/CountdownRing.vue")['default']
  UiEmptyState: typeof import("../../components/ui/EmptyState.vue")['default']
  UiStatCard: typeof import("../../components/ui/StatCard.vue")['default']
  WeekDayRow: typeof import("../../components/week/DayRow.vue")['default']
  WeekMenuDayDetail: typeof import("../../components/week/MenuDayDetail.vue")['default']
  WeekMenuSelector: typeof import("../../components/week/MenuSelector.vue")['default']
  WeekViewToggle: typeof import("../../components/week/ViewToggle.vue")['default']
  NuxtWelcome: typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtImg: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  VitePwaManifest: typeof import("../../node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest")['default']
  NuxtPwaManifest: typeof import("../../node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest")['default']
  NuxtPwaAssets: typeof import("../../node_modules/@vite-pwa/nuxt/dist/runtime/components/NuxtPwaAssets")['default']
  PwaAppleImage: typeof import("../../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaAppleImage.vue")['default']
  PwaAppleSplashScreenImage: typeof import("../../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaAppleSplashScreenImage.vue")['default']
  PwaFaviconImage: typeof import("../../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaFaviconImage.vue")['default']
  PwaMaskableImage: typeof import("../../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaMaskableImage.vue")['default']
  PwaTransparentImage: typeof import("../../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaTransparentImage.vue")['default']
  NuxtPage: typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyAppHeader: LazyComponent<typeof import("../../components/AppHeader.vue")['default']>
  LazyAppIcon: LazyComponent<typeof import("../../components/AppIcon.vue")['default']>
  LazyAppTabbar: LazyComponent<typeof import("../../components/AppTabbar.vue")['default']>
  LazyBaseModal: LazyComponent<typeof import("../../components/BaseModal.vue")['default']>
  LazyExerciseForm: LazyComponent<typeof import("../../components/ExerciseForm.vue")['default']>
  LazyImportDialog: LazyComponent<typeof import("../../components/ImportDialog.vue")['default']>
  LazyMuscleBadge: LazyComponent<typeof import("../../components/MuscleBadge.vue")['default']>
  LazyRestForm: LazyComponent<typeof import("../../components/RestForm.vue")['default']>
  LazyDayEditRoutine: LazyComponent<typeof import("../../components/day/EditRoutine.vue")['default']>
  LazyDayEditSummary: LazyComponent<typeof import("../../components/day/EditSummary.vue")['default']>
  LazyDayHeader: LazyComponent<typeof import("../../components/day/Header.vue")['default']>
  LazyDayNotFoundState: LazyComponent<typeof import("../../components/day/NotFoundState.vue")['default']>
  LazyDayRoutineList: LazyComponent<typeof import("../../components/day/RoutineList.vue")['default']>
  LazyDaySummary: LazyComponent<typeof import("../../components/day/Summary.vue")['default']>
  LazyDayWarmup: LazyComponent<typeof import("../../components/day/Warmup.vue")['default']>
  LazyProgressChart: LazyComponent<typeof import("../../components/progress/Chart.vue")['default']>
  LazyProgressExerciseSelector: LazyComponent<typeof import("../../components/progress/ExerciseSelector.vue")['default']>
  LazyProgressHistory: LazyComponent<typeof import("../../components/progress/History.vue")['default']>
  LazyProgressStats: LazyComponent<typeof import("../../components/progress/Stats.vue")['default']>
  LazyRoutineItemCard: LazyComponent<typeof import("../../components/routine/ItemCard.vue")['default']>
  LazyRoutineItemEditControls: LazyComponent<typeof import("../../components/routine/ItemEditControls.vue")['default']>
  LazyRunAlreadyDoneState: LazyComponent<typeof import("../../components/run/AlreadyDoneState.vue")['default']>
  LazyRunCompleteState: LazyComponent<typeof import("../../components/run/CompleteState.vue")['default']>
  LazyRunExerciseItem: LazyComponent<typeof import("../../components/run/ExerciseItem.vue")['default']>
  LazyRunHeader: LazyComponent<typeof import("../../components/run/Header.vue")['default']>
  LazyRunNotFoundState: LazyComponent<typeof import("../../components/run/NotFoundState.vue")['default']>
  LazyRunNotTodayState: LazyComponent<typeof import("../../components/run/NotTodayState.vue")['default']>
  LazyRunProgressBar: LazyComponent<typeof import("../../components/run/ProgressBar.vue")['default']>
  LazyRunRestItem: LazyComponent<typeof import("../../components/run/RestItem.vue")['default']>
  LazyRunRoutineProgress: LazyComponent<typeof import("../../components/run/RoutineProgress.vue")['default']>
  LazyRunSetRestOverlay: LazyComponent<typeof import("../../components/run/SetRestOverlay.vue")['default']>
  LazyStreakMonthCalendar: LazyComponent<typeof import("../../components/streak/MonthCalendar.vue")['default']>
  LazyStreakRecentSessions: LazyComponent<typeof import("../../components/streak/RecentSessions.vue")['default']>
  LazyStreakSelectedDayInfo: LazyComponent<typeof import("../../components/streak/SelectedDayInfo.vue")['default']>
  LazyStreakStats: LazyComponent<typeof import("../../components/streak/Stats.vue")['default']>
  LazyUiCountdownRing: LazyComponent<typeof import("../../components/ui/CountdownRing.vue")['default']>
  LazyUiEmptyState: LazyComponent<typeof import("../../components/ui/EmptyState.vue")['default']>
  LazyUiStatCard: LazyComponent<typeof import("../../components/ui/StatCard.vue")['default']>
  LazyWeekDayRow: LazyComponent<typeof import("../../components/week/DayRow.vue")['default']>
  LazyWeekMenuDayDetail: LazyComponent<typeof import("../../components/week/MenuDayDetail.vue")['default']>
  LazyWeekMenuSelector: LazyComponent<typeof import("../../components/week/MenuSelector.vue")['default']>
  LazyWeekViewToggle: LazyComponent<typeof import("../../components/week/ViewToggle.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyVitePwaManifest: LazyComponent<typeof import("../../node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest")['default']>
  LazyNuxtPwaManifest: LazyComponent<typeof import("../../node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest")['default']>
  LazyNuxtPwaAssets: LazyComponent<typeof import("../../node_modules/@vite-pwa/nuxt/dist/runtime/components/NuxtPwaAssets")['default']>
  LazyPwaAppleImage: LazyComponent<typeof import("../../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaAppleImage.vue")['default']>
  LazyPwaAppleSplashScreenImage: LazyComponent<typeof import("../../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaAppleSplashScreenImage.vue")['default']>
  LazyPwaFaviconImage: LazyComponent<typeof import("../../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaFaviconImage.vue")['default']>
  LazyPwaMaskableImage: LazyComponent<typeof import("../../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaMaskableImage.vue")['default']>
  LazyPwaTransparentImage: LazyComponent<typeof import("../../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaTransparentImage.vue")['default']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
