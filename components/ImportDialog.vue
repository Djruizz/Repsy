<template>
  <BaseModal :open="true" title="Importar rutinas" @close="$emit('close')">
    <div class="space-y-5">
      <div>
        <label
          class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 bg-ink-800/50 px-4 py-8 text-center transition hover:border-lime/40 hover:bg-ink-800"
          @dragover.prevent="drag = true" @dragleave="drag = false" @drop.prevent="onDrop"
        >
          <AppIcon name="upload" class="h-7 w-7 text-lime" />
          <p class="text-sm font-medium text-slate-200">Arrastra un archivo .json o pulsa para seleccionar</p>
          <p class="text-xs text-slate-500">Reemplaza o fusiona tus rutinas guardadas</p>
          <input type="file" accept="application/json,.json" class="hidden" @change="onFile" />
        </label>
      </div>

      <div class="flex gap-2">
        <button
          v-for="m in modes" :key="m.id"
          class="flex-1 rounded-xl border px-3 py-2.5 text-xs font-semibold transition"
          :class="mode === m.id ? 'border-lime/40 bg-lime/10 text-lime' : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-200'"
          @click="mode = m.id"
        >
          {{ m.label }}
        </button>
      </div>

      <div>
        <p class="label mb-2">O pega el JSON aquí</p>
        <textarea v-model="raw" rows="5" class="input font-mono text-xs" placeholder='{ "days": [...] }' />
      </div>

      <p v-if="error" class="rounded-lg bg-ember/10 px-3 py-2 text-xs text-ember">{{ error }}</p>
      <p v-if="success" class="rounded-lg bg-lime/10 px-3 py-2 text-xs text-lime">{{ success }}</p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
        <button class="btn-primary" :disabled="!raw" @click="doImport">Importar</button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
const { importData } = useGymData()
const emit = defineEmits<{ close: [] }>()

const raw = ref('')
const mode = ref<'replace' | 'merge'>('replace')
const error = ref('')
const success = ref('')
const drag = ref(false)
const modes = [
  { id: 'replace' as const, label: 'Reemplazar todo' },
  { id: 'merge' as const, label: 'Fusionar' }
]

function onFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) readFile(file)
}

function onDrop(e: DragEvent) {
  drag.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) readFile(file)
}

function readFile(file: File) {
  const reader = new FileReader()
  reader.onload = () => { raw.value = String(reader.result || '') }
  reader.readAsText(file)
}

function doImport() {
  error.value = ''
  success.value = ''
  const ok = importData(raw.value, mode.value)
  if (ok) {
    success.value = mode.value === 'replace' ? 'Rutinas reemplazadas correctamente.' : 'Rutinas fusionadas correctamente.'
    setTimeout(() => emit('close'), 700)
  } else {
    error.value = 'El JSON no es válido. Revisa el formato e inténtalo de nuevo.'
  }
}
</script>
