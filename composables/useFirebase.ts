import type { FirebaseApp } from 'firebase/app'
import type { Auth } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

export function useFirebase() {
  const nuxtApp = useNuxtApp()

  return {
    firebaseApp: nuxtApp.$firebaseApp as FirebaseApp | null,
    auth: nuxtApp.$auth as Auth | null,
    db: nuxtApp.$db as Firestore | null
  }
}
