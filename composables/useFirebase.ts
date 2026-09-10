import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

export function useFirebase() {
  const nuxtApp = useNuxtApp()

  return {
    firebaseApp: nuxtApp.$firebaseApp as FirebaseApp,
    auth: nuxtApp.$auth as Auth,
    db: nuxtApp.$db as Firestore
  }
}
