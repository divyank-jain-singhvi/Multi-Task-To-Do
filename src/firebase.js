import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'

// Firebase configuration for tasklist-5d2f8 project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBi8VvGd8uxKuf_g9kxn3Xk9iCZQpR4YHg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tasklist-5d2f8.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://tasklist-5d2f8-default-rtdb.firebaseio.com/",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tasklist-5d2f8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tasklist-5d2f8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "554850504631",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:554850504631:web:b7edcc3185a97b936ba232",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Y44NECHD70"
}

let db = null
let auth = null
let app = null

try {
  // Initialize Firebase app
  app = initializeApp(firebaseConfig)
  db = getDatabase(app)
  auth = getAuth(app)
  console.log('Firebase initialized successfully')
} catch (e) {
  console.error('Firebase initialization failed:', e)
}

export { db, auth }


