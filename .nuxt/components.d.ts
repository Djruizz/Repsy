
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


export const AppHeader: typeof import("../components/AppHeader.vue")['default']
export const AppIcon: typeof import("../components/AppIcon.vue")['default']
export const AppTabbar: typeof import("../components/AppTabbar.vue")['default']
export const BaseModal: typeof import("../components/BaseModal.vue")['default']
export const ExerciseForm: typeof import("../components/ExerciseForm.vue")['default']
export const ImportDialog: typeof import("../components/ImportDialog.vue")['default']
export const MuscleBadge: typeof import("../components/MuscleBadge.vue")['default']
export const RestForm: typeof import("../components/RestForm.vue")['default']
export const DayEditRoutine: typeof import("../components/day/EditRoutine.vue")['default']
export const DayEditSummary: typeof import("../components/day/EditSummary.vue")['default']
export const DayHeader: typeof import("../components/day/Header.vue")['default']
export const DayNotFoundState: typeof import("../components/day/NotFoundState.vue")['default']
export const DayRoutineList: typeof import("../components/day/RoutineList.vue")['default']
export const DaySummary: typeof import("../components/day/Summary.vue")['default']
export const DayWarmup: typeof import("../components/day/Warmup.vue")['default']
export const ProgressChart: typeof import("../components/progress/Chart.vue")['default']
export const ProgressExerciseSelector: typeof import("../components/progress/ExerciseSelector.vue")['default']
export const ProgressHistory: typeof import("../components/progress/History.vue")['default']
export const ProgressStats: typeof import("../components/progress/Stats.vue")['default']
export const RoutineItemCard: typeof import("../components/routine/ItemCard.vue")['default']
export const RoutineItemEditControls: typeof import("../components/routine/ItemEditControls.vue")['default']
export const RunAlreadyDoneState: typeof import("../components/run/AlreadyDoneState.vue")['default']
export const RunCompleteState: typeof import("../components/run/CompleteState.vue")['default']
export const RunExerciseItem: typeof import("../components/run/ExerciseItem.vue")['default']
export const RunHeader: typeof import("../components/run/Header.vue")['default']
export const RunNotFoundState: typeof import("../components/run/NotFoundState.vue")['default']
export const RunNotTodayState: typeof import("../components/run/NotTodayState.vue")['default']
export const RunProgressBar: typeof import("../components/run/ProgressBar.vue")['default']
export const RunRestItem: typeof import("../components/run/RestItem.vue")['default']
export const RunRoutineProgress: typeof import("../components/run/RoutineProgress.vue")['default']
export const RunSetRestOverlay: typeof import("../components/run/SetRestOverlay.vue")['default']
export const StreakMonthCalendar: typeof import("../components/streak/MonthCalendar.vue")['default']
export const StreakRecentSessions: typeof import("../components/streak/RecentSessions.vue")['default']
export const StreakSelectedDayInfo: typeof import("../components/streak/SelectedDayInfo.vue")['default']
export const StreakStats: typeof import("../components/streak/Stats.vue")['default']
export const UiCountdownRing: typeof import("../components/ui/CountdownRing.vue")['default']
export const UiEmptyState: typeof import("../components/ui/EmptyState.vue")['default']
export const UiStatCard: typeof import("../components/ui/StatCard.vue")['default']
export const WeekDayRow: typeof import("../components/week/DayRow.vue")['default']
export const WeekMenuDayDetail: typeof import("../components/week/MenuDayDetail.vue")['default']
export const WeekMenuSelector: typeof import("../components/week/MenuSelector.vue")['default']
export const WeekViewToggle: typeof import("../components/week/ViewToggle.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const VitePwaManifest: typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest")['default']
export const NuxtPwaManifest: typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest")['default']
export const NuxtPwaAssets: typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/NuxtPwaAssets")['default']
export const PwaAppleImage: typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaAppleImage.vue")['default']
export const PwaAppleSplashScreenImage: typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaAppleSplashScreenImage.vue")['default']
export const PwaFaviconImage: typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaFaviconImage.vue")['default']
export const PwaMaskableImage: typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaMaskableImage.vue")['default']
export const PwaTransparentImage: typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaTransparentImage.vue")['default']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyAppHeader: LazyComponent<typeof import("../components/AppHeader.vue")['default']>
export const LazyAppIcon: LazyComponent<typeof import("../components/AppIcon.vue")['default']>
export const LazyAppTabbar: LazyComponent<typeof import("../components/AppTabbar.vue")['default']>
export const LazyBaseModal: LazyComponent<typeof import("../components/BaseModal.vue")['default']>
export const LazyExerciseForm: LazyComponent<typeof import("../components/ExerciseForm.vue")['default']>
export const LazyImportDialog: LazyComponent<typeof import("../components/ImportDialog.vue")['default']>
export const LazyMuscleBadge: LazyComponent<typeof import("../components/MuscleBadge.vue")['default']>
export const LazyRestForm: LazyComponent<typeof import("../components/RestForm.vue")['default']>
export const LazyDayEditRoutine: LazyComponent<typeof import("../components/day/EditRoutine.vue")['default']>
export const LazyDayEditSummary: LazyComponent<typeof import("../components/day/EditSummary.vue")['default']>
export const LazyDayHeader: LazyComponent<typeof import("../components/day/Header.vue")['default']>
export const LazyDayNotFoundState: LazyComponent<typeof import("../components/day/NotFoundState.vue")['default']>
export const LazyDayRoutineList: LazyComponent<typeof import("../components/day/RoutineList.vue")['default']>
export const LazyDaySummary: LazyComponent<typeof import("../components/day/Summary.vue")['default']>
export const LazyDayWarmup: LazyComponent<typeof import("../components/day/Warmup.vue")['default']>
export const LazyProgressChart: LazyComponent<typeof import("../components/progress/Chart.vue")['default']>
export const LazyProgressExerciseSelector: LazyComponent<typeof import("../components/progress/ExerciseSelector.vue")['default']>
export const LazyProgressHistory: LazyComponent<typeof import("../components/progress/History.vue")['default']>
export const LazyProgressStats: LazyComponent<typeof import("../components/progress/Stats.vue")['default']>
export const LazyRoutineItemCard: LazyComponent<typeof import("../components/routine/ItemCard.vue")['default']>
export const LazyRoutineItemEditControls: LazyComponent<typeof import("../components/routine/ItemEditControls.vue")['default']>
export const LazyRunAlreadyDoneState: LazyComponent<typeof import("../components/run/AlreadyDoneState.vue")['default']>
export const LazyRunCompleteState: LazyComponent<typeof import("../components/run/CompleteState.vue")['default']>
export const LazyRunExerciseItem: LazyComponent<typeof import("../components/run/ExerciseItem.vue")['default']>
export const LazyRunHeader: LazyComponent<typeof import("../components/run/Header.vue")['default']>
export const LazyRunNotFoundState: LazyComponent<typeof import("../components/run/NotFoundState.vue")['default']>
export const LazyRunNotTodayState: LazyComponent<typeof import("../components/run/NotTodayState.vue")['default']>
export const LazyRunProgressBar: LazyComponent<typeof import("../components/run/ProgressBar.vue")['default']>
export const LazyRunRestItem: LazyComponent<typeof import("../components/run/RestItem.vue")['default']>
export const LazyRunRoutineProgress: LazyComponent<typeof import("../components/run/RoutineProgress.vue")['default']>
export const LazyRunSetRestOverlay: LazyComponent<typeof import("../components/run/SetRestOverlay.vue")['default']>
export const LazyStreakMonthCalendar: LazyComponent<typeof import("../components/streak/MonthCalendar.vue")['default']>
export const LazyStreakRecentSessions: LazyComponent<typeof import("../components/streak/RecentSessions.vue")['default']>
export const LazyStreakSelectedDayInfo: LazyComponent<typeof import("../components/streak/SelectedDayInfo.vue")['default']>
export const LazyStreakStats: LazyComponent<typeof import("../components/streak/Stats.vue")['default']>
export const LazyUiCountdownRing: LazyComponent<typeof import("../components/ui/CountdownRing.vue")['default']>
export const LazyUiEmptyState: LazyComponent<typeof import("../components/ui/EmptyState.vue")['default']>
export const LazyUiStatCard: LazyComponent<typeof import("../components/ui/StatCard.vue")['default']>
export const LazyWeekDayRow: LazyComponent<typeof import("../components/week/DayRow.vue")['default']>
export const LazyWeekMenuDayDetail: LazyComponent<typeof import("../components/week/MenuDayDetail.vue")['default']>
export const LazyWeekMenuSelector: LazyComponent<typeof import("../components/week/MenuSelector.vue")['default']>
export const LazyWeekViewToggle: LazyComponent<typeof import("../components/week/ViewToggle.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyVitePwaManifest: LazyComponent<typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest")['default']>
export const LazyNuxtPwaManifest: LazyComponent<typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/VitePwaManifest")['default']>
export const LazyNuxtPwaAssets: LazyComponent<typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/NuxtPwaAssets")['default']>
export const LazyPwaAppleImage: LazyComponent<typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaAppleImage.vue")['default']>
export const LazyPwaAppleSplashScreenImage: LazyComponent<typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaAppleSplashScreenImage.vue")['default']>
export const LazyPwaFaviconImage: LazyComponent<typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaFaviconImage.vue")['default']>
export const LazyPwaMaskableImage: LazyComponent<typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaMaskableImage.vue")['default']>
export const LazyPwaTransparentImage: LazyComponent<typeof import("../node_modules/@vite-pwa/nuxt/dist/runtime/components/PwaTransparentImage.vue")['default']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
