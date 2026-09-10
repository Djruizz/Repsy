<template>
  <BaseModal :open="true" :title="mode === 'login' ? 'Acceder a tu cuenta' : 'Crear cuenta'" @close="$emit('close')">
    <form class="space-y-5" @submit.prevent="submit">
      <div>
        <label class="label mb-2" for="auth-email">Correo</label>
        <input
          id="auth-email"
          v-model="email"
          type="email"
          class="input"
          placeholder="tu@correo.com"
          autocomplete="email"
          required
        />
      </div>

      <div>
        <label class="label mb-2" for="auth-password">Contraseña</label>
        <input
          id="auth-password"
          v-model="password"
          type="password"
          class="input"
          placeholder="Mínimo 6 caracteres"
          :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
          required
          minlength="6"
        />
      </div>

      <p v-if="error" class="rounded-lg bg-ember/10 px-3 py-2 text-xs text-ember">{{ error }}</p>
    </form>

    <template #footer>
      <div class="flex flex-col gap-3">
        <button class="btn-primary w-full" :disabled="loading" @click="submit">
          {{ loading ? 'Un momento…' : mode === 'login' ? 'Acceder' : 'Crear cuenta' }}
        </button>
        <button
          class="text-xs font-medium text-center text-slate-500 transition hover:text-slate-300"
          @click="toggleMode"
        >
          {{
            mode === 'login'
              ? '¿No tienes cuenta? Crear una nueva'
              : '¿Ya tienes cuenta? Acceder'
          }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
const { login, register } = useAuth()
const emit = defineEmits<{ close: [] }>()

const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  error.value = ''
}

async function submit() {
  if (loading.value) return
  error.value = ''
  loading.value = true
  const err =
    mode.value === 'login'
      ? await login(email.value, password.value)
      : await register(email.value, password.value)
  loading.value = false
  if (err) {
    error.value = err
  } else {
    emit('close')
  }
}
</script>
