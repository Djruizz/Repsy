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

      <div class="flex items-center gap-1.5">
        <button class="px-3 py-2 text-xs btn-ghost" @click="showImport = true">
          <AppIcon name="import" class="w-4 h-4" />
          <span class="hidden sm:inline">Importar</span>
        </button>
        <button class="px-3 py-2 text-xs btn-ghost" @click="doExport">
          <AppIcon name="export" class="w-4 h-4" />
          <span class="hidden sm:inline">Exportar</span>
        </button>
      </div>
    </div>

    <LazyImportDialog v-if="showImport" @close="showImport = false" />
  </header>
</template>

<script setup lang="ts">
const { exportData } = useGymData();
const showImport = ref(false);

function doExport() {
  const blob = new Blob([exportData()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gymapp-rutinas-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>
