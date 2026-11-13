<template>
  <header
    class="sticky top-0 z-40 border-b border-white/5 bg-ink-900/80 backdrop-blur-xl"
    style="padding-top: var(--safe-top)"
  >
    <div
      class="flex items-center justify-between w-full max-w-5xl px-4 py-3 mx-auto sm:px-6"
    >
      <NuxtLink to="/" class="flex items-center gap-2.5">
        <span
          class="grid w-8 h-8 rounded-lg place-items-center bg-lime text-ink-950 shadow-glow"
        >
          <AppIcon name="dumbbell" class="w-5 h-5" :stroke-width="2.4" />
        </span>
        <div class="leading-none">
          <p class="text-sm font-bold tracking-tight text-white">Repsy</p>
          <p class="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Rutinas
          </p>
        </div>
      </NuxtLink>

      <div class="flex items-center gap-2">
        <span
          v-if="lastError"
          class="inline-flex items-center gap-1.5 rounded-full bg-ember/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ember"
          title="No se pudo sincronizar con la nube. Se reintentará automáticamente."
        >
          <AppIcon name="cloud-off" class="h-3.5 w-3.5" />
          Sync
        </span>

        <NuxtLink
          v-if="runningSession"
          :to="`/correr/${runningSession.dayId}`"
          class="inline-flex items-center gap-1.5 rounded-full bg-sky-400/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-300 transition hover:bg-sky-400/25"
          title="Sesión en curso"
        >
          <span class="relative flex h-1.5 w-1.5">
            <span
              class="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-sky-400"
            />
            <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-400" />
          </span>
          En curso
        </NuxtLink>

        <div class="relative" data-menu-root>
          <button
            class="grid transition rounded-lg h-9 w-9 place-items-center text-slate-400 hover:bg-white/5 hover:text-white"
            :class="menuOpen ? 'bg-white/5 text-white' : ''"
            @click="menuOpen = !menuOpen"
          >
            <AppIcon name="menu" class="w-5 h-5" />
          </button>

          <Transition name="dropdown">
            <div
              v-if="menuOpen"
              class="absolute right-0 z-50 overflow-hidden border shadow-xl top-11 w-60 rounded-xl border-white/10 bg-ink-800"
            >
              <template v-if="isLoggedIn">
                <div class="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                  <AppIcon name="user" class="w-4 h-4 text-lime" />
                  <p class="text-xs font-medium truncate text-slate-300">{{ userEmail }}</p>
                </div>
                <button
                  class="flex items-center w-full gap-3 px-4 py-3 text-sm transition text-slate-300 hover:bg-white/5 hover:text-white"
                  @click="onLogout"
                >
                  <AppIcon name="logout" class="w-4 h-4" />
                  Cerrar sesión
                </button>
              </template>
              <button
                v-else
                class="flex items-center w-full gap-3 px-4 py-3 text-sm transition text-slate-300 hover:bg-white/5 hover:text-white"
                @click="onLogin"
              >
                <AppIcon name="user" class="w-4 h-4" />
                Acceder
              </button>
              <div class="border-t border-white/5">
                <button
                  class="flex items-center w-full gap-3 px-4 py-3 text-sm transition text-slate-300 hover:bg-white/5 hover:text-white"
                  @click="onImport"
                >
                  <AppIcon name="import" class="w-4 h-4" />
                  Importar
                </button>
                <button
                  class="flex items-center w-full gap-3 px-4 py-3 text-sm transition text-slate-300 hover:bg-white/5 hover:text-white"
                  @click="onExport"
                >
                  <AppIcon name="export" class="w-4 h-4" />
                  Exportar
                </button>
                <button
                  class="flex items-center w-full gap-3 px-4 py-3 text-sm transition text-slate-300 hover:bg-white/5 hover:text-white"
                  @click="onToggleMute"
                >
                  <AppIcon
                    :name="muted ? 'volume-off' : 'volume-on'"
                    class="w-4 h-4"
                  />
                  {{ muted ? "Activar sonido" : "Silenciar" }}
                </button>
                <button
                  class="flex items-center justify-between w-full gap-3 px-4 py-3 text-sm transition text-slate-300 hover:bg-white/5 hover:text-white"
                  @click="onToggleNotifications"
                >
                  <span class="flex items-center gap-3">
                    <AppIcon
                      :name="canNotify ? 'bell' : 'bell-off'"
                      class="w-4 h-4"
                      :class="canNotify ? 'text-lime' : ''"
                    />
                    Notificaciones
                  </span>
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider"
                    :class="canNotify ? 'text-lime' : 'text-slate-500'"
                  >
                    {{ canNotify ? "ON" : "OFF" }}
                  </span>
                </button>
                <button
                  class="flex items-center justify-between w-full gap-3 px-4 py-3 text-sm transition text-slate-300 hover:bg-white/5 hover:text-white"
                  @click="toggleLockScreen"
                >
                  <span class="flex items-center gap-3">
                    <AppIcon
                      name="lock"
                      class="w-4 h-4"
                      :class="lockScreenEnabled ? 'text-lime' : ''"
                    />
                    Timer en bloqueo
                  </span>
                  <span
                    class="text-[10px] font-bold uppercase tracking-wider"
                    :class="lockScreenEnabled ? 'text-lime' : 'text-slate-500'"
                  >
                    {{ lockScreenEnabled ? "ON" : "OFF" }}
                  </span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <LazyImportDialog v-if="showImport" @close="showImport = false" />
    <LazyAuthDialog v-if="showAuth" @close="showAuth = false" />
    <BaseModal
      :open="!!notifNotice"
      title="Notificaciones"
      @close="notifNotice = ''"
    >
      <p class="text-sm leading-relaxed text-slate-300">
        {{ notifNotice }}
      </p>
      <template #footer>
        <button class="w-full btn-primary" @click="notifNotice = ''">
          Entendido
        </button>
      </template>
    </BaseModal>
  </header>
</template>

<script setup lang="ts">
import { useSoundCue } from "~/composables/useSoundCue";
import { useTimerNotifications } from "~/composables/useTimerNotifications";
import { localDayKey, todayKey } from "~/composables/useCalendar";

const { exportData, sessions, resetAll } = useGymData();
const { muted, toggleMuted } = useSoundCue();
const {
  canNotify,
  lockScreenEnabled,
  toggleNotifications,
  toggleLockScreen,
} = useTimerNotifications();
const { isLoggedIn, userEmail, logout } = useAuth();
const { lastError, clearDeviceOwnership } = useSync();
const showImport = ref(false);
const showAuth = ref(false);
const menuOpen = ref(false);
const notifNotice = ref("");

// Solo sesiones activas de hoy: una sesión de otro día llevaría a un
// runner bloqueado ("no es tu día") y nunca podría finalizarse.
const runningSession = computed(() =>
  sessions.value.find(
    (s) =>
      !s.completed && localDayKey(s.startedAt ?? s.date) === todayKey(),
  ),
);

function onImport() {
  menuOpen.value = false;
  showImport.value = true;
}

function onLogin() {
  menuOpen.value = false;
  showAuth.value = true;
}

async function onLogout() {
  menuOpen.value = false;
  try {
    await logout();
  } catch (err) {
    console.warn("[auth] Error al cerrar sesión:", err);
    return;
  }
  // Borrar los datos locales de la cuenta en este dispositivo.
  // Si hay cambios sin sincronizar, pedir confirmación (pérdida de datos).
  const wipe = lastError.value
    ? window.confirm(
        "No se pudieron sincronizar algunos cambios con la nube.\n¿Borrar igualmente los datos locales de este dispositivo?",
      )
    : true;
  if (wipe) {
    clearDeviceOwnership();
    resetAll();
  }
}

function onExport() {
  menuOpen.value = false;
  const blob = new Blob([exportData()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gymapp-rutinas-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function onToggleMute() {
  toggleMuted();
}

async function onToggleNotifications() {
  const res = await toggleNotifications();
  if (res.ok) return;
  menuOpen.value = false;
  if (res.reason === "ios-install-required") {
    notifNotice.value =
      'En iPhone/iPad las notificaciones solo funcionan con la app instalada: pulsa Compartir → "Agregar a pantalla de inicio" y abre Repsy desde tu pantalla de inicio.';
  } else if (res.reason === "denied") {
    notifNotice.value =
      "El permiso de notificaciones está bloqueado para este sitio. Habilítalo en los ajustes del navegador o de la app para recibir avisos al terminar los descansos.";
  } else {
    notifNotice.value =
      "Este navegador no soporta notificaciones del sistema. Seguirás teniendo sonido, vibración y el contador en la pantalla de bloqueo.";
  }
}

function closeOnOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest("[data-menu-root]")) menuOpen.value = false;
}

onMounted(() => document.addEventListener("click", closeOnOutside));
onUnmounted(() => document.removeEventListener("click", closeOnOutside));
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.97);
}
</style>
