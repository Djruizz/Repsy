<template>
  <section>
    <h2 class="label mb-2">Historial detallado</h2>
    <div class="space-y-1.5">
      <div
        v-for="(entry, idx) in entries"
        :key="idx"
        class="surface flex items-center gap-3 p-3.5"
      >
        <div class="flex flex-col items-center">
          <span class="text-xs font-semibold text-slate-400">{{ formatDateShort(entry.date) }}</span>
          <span class="text-[10px] text-slate-600">{{ formatTimeShort(entry.date) }}</span>
        </div>
        <div class="h-8 w-px bg-white/5" />
        <div class="flex flex-1 flex-wrap gap-1.5">
          <span
            v-for="s in entry.sets"
            :key="s.setIdx"
            class="chip bg-white/5 text-slate-300"
          >
            S{{ s.setIdx + 1 }}: <b class="font-mono text-slate-200">{{ s.weight }}</b>kg
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface GroupedEntry { date: string; sets: { setIdx: number; weight: number }[] }

defineProps<{ entries: GroupedEntry[] }>()

function formatDateShort(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}`
}
function formatTimeShort(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}
</script>
