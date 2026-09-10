import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public

  const firebaseConfig = {
    apiKey: config.firebaseApiKey,
    authDomain: config.firebaseAuthDomain,
    projectId: config.firebaseProjectId,
    storageBucket: config.firebaseStorageBucket,
    messagingSenderId: config.firebaseMessagingSenderId,
    appId: config.firebaseAppId
  }

  let provided: {
    firebaseApp: FirebaseApp | null
    auth: Auth | null
    db: Firestore | null
  }

  const missing = Object.entries(firebaseConfig).filter(([, v]) => !v).map(([k]) => k)
  if (missing.length) {
    console.warn(
      `[firebase] Faltan variables de configuración: ${missing.join(', ')}. ` +
      'La sincronización en la nube estará desactivada. ' +
      'Revisa tu .env (NUXT_PUBLIC_FIREBASE_*)'
    )
    provided = { firebaseApp: null, auth: null, db: null }
  } else {
    // Previene re-inicializar si ya existe una instancia
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
    provided = { firebaseApp: app, auth: getAuth(app), db: getFirestore(app) }
  }

  return {
    provide: provided
  }
})
