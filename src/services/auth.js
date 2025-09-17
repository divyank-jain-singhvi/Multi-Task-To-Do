import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { setAccessKeyForEmail, getAccessKeyForEmail, getAccessInfoForEmail, setAccessValidatedForEmail } from './realtime'
import { auth } from '../firebase'

function generateAccessKey() {
  const bytes = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function signUp(email, password) {
  if (!auth) {
    console.error('Firebase Auth not initialized')
    throw new Error('Authentication service not available. Please check Firebase configuration.')
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    // Generate and store access key for this email to gate future logins
    const key = generateAccessKey()
    try { await setAccessKeyForEmail(email, key, result.user.uid) } catch {}
    console.log('User created successfully:', result.user.email)
    // Immediately sign out so user returns to login and enters key
    try { await signOut(auth) } catch {}
    return result
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}

export async function signIn(email, password, accessKey) {
  if (!auth) {
    console.error('Firebase Auth not initialized')
    throw new Error('Authentication service not available. Please check Firebase configuration.')
  }
  try {
    // First-time access requires access key; subsequent logins skip it
    const info = await getAccessInfoForEmail(email)
    const key = info && info.key
    const validated = !!(info && (info.validated || info.onceLogged))
    if (!validated) {
      if (!key) {
        const err = new Error('Access not provisioned for this email')
        err.code = 'auth/access-key-missing'
        throw err
      }
      if (!accessKey || accessKey !== key) {
        const err = new Error('Invalid access key')
        err.code = 'auth/invalid-access-key'
        throw err
      }
    }
    const result = await signInWithEmailAndPassword(auth, email, password)
    // If this was the first successful key login, mark as validated
    if (!validated) {
      try { await setAccessValidatedForEmail(email, result.user.uid) } catch {}
    }
    console.log('User signed in successfully:', result.user.email)
    return result
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

export async function logout() {
  if (!auth) {
    console.error('Firebase Auth not initialized')
    throw new Error('Authentication service not available')
  }
  try {
    await signOut(auth)
    console.log('User signed out successfully')
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}

export function onAuthChange(callback) {
  if (!auth) {
    console.warn('Firebase Auth not initialized, returning null user')
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}
