import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCAKT9ZYVv9j4y1PkoDh7xrTt4X83lcKlM',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'church-checkin-86d4d.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'church-checkin-86d4d',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'church-checkin-86d4d.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '897490915227',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:897490915227:web:f98550179db34753749b3e',
}

const isDemoMode = firebaseConfig.apiKey === 'demo_api_key_for_testing' || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY

let app: any = null
let db: any = null

if (!isDemoMode) {
  try {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
  } catch (error) {
    console.warn('Firebase initialization failed. Running in demo mode.', error)
  }
}

export { db, isDemoMode }
