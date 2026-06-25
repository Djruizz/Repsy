<template>
  <svg
    viewBox="0 0 24 24"
    class="shrink-0"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <g v-html="paths[name]"></g>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ name: string; strokeWidth?: number }>(), { strokeWidth: 2 })

const paths: Record<string, string> = {
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 3v3M16 3v3"/>',
  flame: '<path d="M12 3c.5 3-2 4.5-2 7a2 2 0 0 0 4 0c0-1 .5-2 1-2.5C16 10 17 12 17 14a5 5 0 0 1-10 0c0-3.5 3-5 5-11z"/>',
  import: '<path d="M12 15V4M8 11l4 4 4-4M5 19h14"/>',
  export: '<path d="M12 4v11M8 8l4-4 4 4M5 19h14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  play: '<path d="M7 5.5l11 6.5-11 6.5z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="7" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="13.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none"/>',
  stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor" stroke="none"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  skip: '<path d="M6 5l9 7-9 7zM18 5v14"/>',
  trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>',
  dumbbell: '<path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  'arrow-left': '<path d="M15 5l-7 7 7 7"/>',
  'arrow-right': '<path d="M9 5l7 7-7 7"/>',
  'chevron-up': '<path d="M6 15l6-6 6 6"/>',
  'chevron-down': '<path d="M6 9l6 6 6-6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  rest: '<path d="M6 14a6 6 0 0 1 1-11 4 4 0 0 1 4 4"/><path d="M9 14h9a2.5 2.5 0 0 0 0-5"/>',
  edit: '<path d="M4 20h4l10-10-4-4L4 16zM13 6l4 4"/>',
  sparkles: '<path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z"/>',
  timer: '<circle cx="12" cy="13" r="7.5"/><path d="M9 3h6M12 8v5l2.5 2"/>',
  download: '<path d="M12 4v11M8 11l4 4 4-4M5 19h14"/>',
  upload: '<path d="M12 15V4M8 8l4-4 4 4M5 19h14"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  reset: '<path d="M4 5v5h5"/><path d="M4.5 10A8 8 0 1 1 5 16.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'
}
</script>
