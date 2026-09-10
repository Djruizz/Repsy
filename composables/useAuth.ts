import { ref, computed } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import type { User } from 'firebase/auth'

const user = ref<User | null>(null)
const authReady = ref(false)
let stateInitialized = false

const NOT_CONFIGURED = 'La sincronización en la nube no está configurada en esta compilación.'

const ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Ya existe una cuenta con este correo.',
  'auth/invalid-email': 'El correo no es válido.',
  'auth/weak-password': 'La contraseña es demasiado débil (mínimo 6 caracteres).',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'Correo o contraseña incorrectos.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  'auth/network-request-failed': 'Error de red. Revisa tu conexión e inténtalo de nuevo.',
  'auth/operation-not-allowed': 'El acceso con correo y contraseña no está habilitado en Firebase.',
  'auth/missing-password': 'Introduce una contraseña.'
}

function translateError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? ''
  return ERROR_MESSAGES[code] ?? 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}

export function useAuth() {
  const { auth } = useFirebase()

  if (!stateInitialized) {
    stateInitialized = true
    if (auth) {
      onAuthStateChanged(auth, (u) => {
        user.value = u
        authReady.value = true
      })
    } else {
      // Sin Firebase configurado: la app funciona 100% local
      authReady.value = true
    }
  }

  const isLoggedIn = computed(() => user.value !== null)
  const userEmail = computed(() => user.value?.email ?? '')

  async function register(email: string, password: string): Promise<string | null> {
    if (!auth) return NOT_CONFIGURED
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password)
      return null
    } catch (err) {
      return translateError(err)
    }
  }

  async function login(email: string, password: string): Promise<string | null> {
    if (!auth) return NOT_CONFIGURED
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      return null
    } catch (err) {
      return translateError(err)
    }
  }

  async function logout(): Promise<void> {
    if (!auth) return
    await signOut(auth)
  }

  return { user, authReady, isLoggedIn, userEmail, login, register, logout }
}
