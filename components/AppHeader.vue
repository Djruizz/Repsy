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
        <NuxtLink
          v-if="runningSession"
          :to="`/correr/${runningSession.dayId}`"
          class="inline-flex items-center gap-1.5 rounded-full bg-sky-400/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-300 transition hover:bg-sky-400/25"
          title="Sesión en curso"
        >
          <span class="relative flex h-1.5 w-1.5">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"
            />
            <span
              class="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-400"
            />
          </span>
          En curso
        </NuxtLink>

        <div class="relative" data-menu-root>
          <button
            class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
            :class="menuOpen ? 'bg-white/5 text-white' : ''"
            @click="menuOpen = !menuOpen"
          >
            <AppIcon name="menu" class="w-5 h-5" />
          </button>

          <Transition name="dropdown">
            <div
              v-if="menuOpen"
              class="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-xl border border-white/10 bg-ink-800 shadow-xl"
            >
              <button
                class="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                @click="onImport"
              >
                <AppIcon name="import" class="w-4 h-4" />
                Importar
              </button>
              <button
                class="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                @click="onExport"
              >
                <AppIcon name="export" class="w-4 h-4" />
                Exportar
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <LazyImportDialog v-if="showImport" @close="showImport = false" />
  </header>
</template>

<script setup lang="ts">
const { exportData, sessions } = useGymData();
const showImport = ref(false);
const menuOpen = ref(false);

const runningSession = computed(() =>
  sessions.value.find((s) => !s.completed),
);

function onImport() {
  menuOpen.value = false;
  showImport.value = true;
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

function closeOnOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest('[data-menu-root]')) menuOpen.value = false;
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
