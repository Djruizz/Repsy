import { ref, watch } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { GymData } from '~/types'

const SYNC_UID_KEY = 'gymapp:syncUid'
const PUSH_DEBOUNCE_MS = 1500

const syncing = ref(false)
const lastError = ref('')
let syncInitialized = false
let ready = false
let lastSyncedUpdatedAt: string | undefined
let pushTimer: ReturnType<typeof setTimeout> | null = null

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

export function useSync() {
  const { db } = useFirebase()
  const { user, authReady } = useAuth()
  const { data, applyRemote, resetAll } = useGymData()

  if (!syncInitialized) {
    syncInitialized = true

    watch(user, (u) => {
      if (u) void pull(u.uid)
    })

    watch(
      data,
      () => {
        if (!user.value || !ready) return
        if (data.value.updatedAt === lastSyncedUpdatedAt) return
        if (pushTimer) clearTimeout(pushTimer)
        pushTimer = setTimeout(() => {
          pushTimer = null
          void push()
        }, PUSH_DEBOUNCE_MS)
      },
      { deep: true }
    )
  }

  async function pull(uid: string) {
    if (!authReady.value) return
    ready = false
    syncing.value = true
    lastError.value = ''
    try {
      const snap = await getDoc(doc(db, 'users', uid))
      if (user.value?.uid !== uid) return

      const claimed = ownerUid()

      if (snap.exists()) {
        const remote = snap.data() as Partial<GymData>
        if (claimed !== uid) {
          // dispositivo sin reclamar (primera sincronización) u otra cuenta usaba esta caché: manda la nube
          claimUid(uid)
          lastSyncedUpdatedAt = remote.updatedAt
          applyRemote(remote)
        } else if ((remote.updatedAt ?? '') > (data.value.updatedAt ?? '')) {
          lastSyncedUpdatedAt = remote.updatedAt
          applyRemote(remote)
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
        resetAll()
        await push()
      }
      ready = true
    } catch (err) {
      console.warn('[sync] Error al sincronizar con Firestore:', err)
      lastError.value = 'No se pudo sincronizar con la nube.'
    } finally {
      syncing.value = false
    }
  }

  async function push() {
    const uid = user.value?.uid
    if (!uid) return
    try {
      if (!data.value.updatedAt) data.value.updatedAt = new Date().toISOString()
      // round-trip JSON: garantiza un payload plano sin undefined (Firestore los rechaza)
      const payload = JSON.parse(JSON.stringify(data.value)) as GymData
      await setDoc(doc(db, 'users', uid), payload)
      lastSyncedUpdatedAt = payload.updatedAt
    } catch (err) {
      console.warn('[sync] Error al guardar en Firestore:', err)
      lastError.value = 'No se pudo guardar en la nube.'
    }
  }

  return { syncing, lastError }
}
