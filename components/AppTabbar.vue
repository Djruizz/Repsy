<template>
  <nav class="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-ink-900/90 backdrop-blur-xl" style="padding-bottom: var(--safe-bottom)">
    <div class="mx-auto flex w-full max-w-5xl items-stretch justify-around px-4">
      <NuxtLink
        v-for="t in tabs"
        :key="t.to"
        :to="t.to"
        class="group relative flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium"
        :class="isActive(t) ? 'text-lime' : 'text-slate-500 hover:text-slate-300'"
      >
        <span v-if="isActive(t)" class="absolute -top-px h-0.5 w-8 rounded-full bg-lime" />
        <AppIcon :name="t.icon" class="h-5 w-5" />
        <span>{{ t.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const tabs = [
  { to: '/', label: 'Semana', icon: 'calendar' as const, match: ['/'] },
  { to: '/calendario', label: 'Racha', icon: 'flame' as const, match: ['/calendario'] },
  { to: '/progreso', label: 'Progreso', icon: 'dumbbell' as const, match: ['/progreso'] }
]

function isActive(t: { match: string[] }) {
  return t.match.some((m) => (m === '/' ? route.path === '/' : route.path.startsWith(m)))
}
</script>
