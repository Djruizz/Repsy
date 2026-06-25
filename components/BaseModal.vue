<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      >
        <div
          class="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
          @click="$emit('close')"
        />
        <div
          class="relative w-full max-w-lg overflow-hidden rounded-b-none surface-raised rounded-t-3xl sm:rounded-t-3xl animate-fade-up"
        >
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-white/5"
          >
            <h3 class="text-sm font-bold text-white">{{ title }}</h3>
            <button
              class="grid w-8 h-8 rounded-lg place-items-center text-slate-400 hover:bg-white/5 hover:text-white"
              @click="$emit('close')"
            >
              <AppIcon name="close" class="w-4 h-4" />
            </button>
          </div>
          <div class="max-h-[70vh] overflow-y-auto px-5 py-5">
            <slot />
          </div>
          <div v-if="$slots.footer" class="px-5 py-4 border-t border-white/5">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ open?: boolean; title: string }>();
defineEmits<{ close: [] }>();
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .surface-raised,
.modal-leave-active .surface-raised {
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .surface-raised,
.modal-leave-to .surface-raised {
  transform: translateY(24px);
}
</style>
