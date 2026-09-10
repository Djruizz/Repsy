import { ref, watch, type Ref } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import type { GymData } from '~/types'

const SYNC_UID_KEY = 'gymapp:syncUid'
const PUSH_DEBOUNCE_MS = 1500
const RETRY_MS = 30_000

const syncing = ref(false)
const lastError = ref('')
let syncInitialized = false
let ready = false
let lastSyncedUpdatedAt: string | undefined
let pushTimer: ReturnType<typeof setTimeout> | null = null
let pushRetryTimer: ReturnType<typeof setTimeout> | null = null
let pullRetryTimer: ReturnType<typeof setTimeout> | null = null

// Dependencias capturadas en el primer useSync() (contexto de setup válido);
// pull/push también corren desde timers, fuera de todo contexto de Nuxt.
let db: Firestore | null = null
let user: Ref<User | null> | null = null
let authReady: Ref<boolean> | null = null
let gym: ReturnType<typeof useGymData> | null = null

function ownerUid(): string | null {
  try {
    return localStorage.getItem(SYNC_UID_KEY)
  } catch {
    return null
  }
}

function claimUid(uid: string) {
  try {
    localStorage.setItem(SYNC_UID_KEY, uid)
  } catch {
    // sin caché de propiedad: cada login tratara el local como no reclamado
  }
}

function clearTimers() {
  for (const t of [pushTimer, pushRetryTimer, pullRetryTimer]) {
    if (t) clearTimeout(t)
  }
  pushTimer = null
  pushRetryTimer = null
  pullRetryTimer = null
}

function schedulePushRetry() {
  if (pushRetryTimer) return
  pushRetryTimer = setTimeout(() => {
    pushRetryTimer = null
    if (ready) void push()
  }, RETRY_MS)
}

function schedulePullRetry(uid: string) {
  if (pullRetryTimer) return
  pullRetryTimer = setTimeout(() => {
    pullRetryTimer = null
    if (user?.value?.uid === uid) void pull(uid)
  }, RETRY_MS)
}

async function pull(uid: string) {
  if (!authReady?.value || !db || !gym) return
  syncing.value = true
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (user?.value?.uid !== uid) return

    const claimed = ownerUid()

    if (snap.exists()) {
      const remote = snap.data() as Partial<GymData>
      if (claimed !== uid) {
        // dispositivo sin reclamar (primera sincronización) u otra cuenta usaba esta caché: manda la nube
        claimUid(uid)
        lastSyncedUpdatedAt = remote.updatedAt
        gym.applyRemote(remote)
      } else if ((remote.updatedAt ?? '') > (gym.data.value.updatedAt ?? '')) {
        lastSyncedUpdatedAt = remote.updatedAt
        gym.applyRemote(remote)
      } else {
        await push()
      }
    } else if (claimed === null) {
      // primera sincronización del dispositivo sin datos en la nube: migra el localStorage
      claimUid(uid)
      await push()
    } else if (claimed === uid) {
      // el doc remoto fue borrado: re-crear desde local
      await push()
    } else {
      // otra cuenta sin datos en la nube: empezar de cero (nunca subir datos de la cuenta anterior)
      claimUid(uid)
      gym.resetAll()
      await push()
    }
    lastError.value = ''
    if (pullRetryTimer) {
      clearTimeout(pullRetryTimer)
      pullRetryTimer = null
    }
    ready = true
  } catch (err) {
    console.warn('[sync] Error al sincronizar con Firestore:', err)
    lastError.value = 'No se pudo sincronizar con la nube.'
    // ready sigue en false: no empujamos datos locales hasta confirmar el
    // estado remoto (podría ser más nuevo). Reintentar el pull.
    schedulePullRetry(uid)
  } finally {
    syncing.value = false
  }
}

async function push() {
  const uid = user?.value?.uid
  if (!uid || !db || !gym) return
  try {
    if (!gym.data.value.updatedAt) gym.data.value.updatedAt = new Date().toISOString()
    // round-trip JSON: garantiza un payload plano sin undefined (Firestore los rechaza)
    const payload = JSON.parse(JSON.stringify(gym.data.value)) as GymData
    await setDoc(doc(db, 'users', uid), payload)
    lastSyncedUpdatedAt = payload.updatedAt
    lastError.value = ''
    if (pushRetryTimer) {
      clearTimeout(pushRetryTimer)
      pushRetryTimer = null
    }
  } catch (err) {
    console.warn('[sync] Error al guardar en Firestore:', err)
    lastError.value = 'No se pudo guardar en la nube.'
    schedulePushRetry()
  }
}

/** Limpia la propiedad del dispositivo (al cerrar sesión). */
function clearDeviceOwnership() {
  try {
    localStorage.removeItem(SYNC_UID_KEY)
  } catch {
    /* ignore */
  }
  clearTimers()
  ready = false
  lastSyncedUpdatedAt = undefined
  lastError.value = ''
  syncing.value = false
}

export function useSync() {
  if (!db) {
    db = useFirebase().db
    const auth = useAuth()
    user = auth.user
    authReady = auth.authReady
    gym = useGymData()
  }
  const userRef = user!
  const gymRef = gym!

  if (!syncInitialized) {
    syncInitialized = true

    watch(userRef, (u) => {
      if (u) {
        void pull(u.uid)
      } else {
        clearTimers()
      }
    })

    watch(
      gymRef.data,
      () => {
        if (!user?.value || !ready) return
        if (gymRef.data.value.updatedAt === lastSyncedUpdatedAt) return
        if (pushTimer) clearTimeout(pushTimer)
        pushTimer = setTimeout(() => {
          pushTimer = null
          void push()
        }, PUSH_DEBOUNCE_MS)
      },
      { deep: true },
    )
  }

  return { syncing, lastError, clearDeviceOwnership }
}
