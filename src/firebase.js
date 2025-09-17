import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'

// Firebase configuration for tasklist-5d2f8 project
const firebaseConfig = {
  apiKey: "AIzaSyBi8VvGd8uxKuf_g9kxn3Xk9iCZQpR4YHg",
  authDomain: "tasklist-5d2f8.firebaseapp.com",
  databaseURL: "https://tasklist-5d2f8-default-rtdb.firebaseio.com/",
  projectId: "tasklist-5d2f8",
  storageBucket: "tasklist-5d2f8.firebasestorage.app",
  messagingSenderId: "554850504631",
  appId: "1:554850504631:web:b7edcc3185a97b936ba232",
  measurementId: "G-Y44NECHD70"
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


