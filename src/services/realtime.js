import { ref, onValue, set, child, get } from 'firebase/database'
import { db } from '../firebase'

const root = (userId) => ref(db, `users/${userId}`)

export function subscribeDay(userId, dateKey, callback) {
  if (!db) {
    // fallback: no-op subscription returning default
    let cancelled = false
    setTimeout(() => {
      if (!cancelled) callback({ tasks: {}, note: '' })
    }, 0)
    return () => { cancelled = true }
  }
  const r = child(root(userId), `days/${dateKey}`)
  const unsub = onValue(r, (snap) => {
    const data = snap.exists() ? snap.val() : { tasks: {}, note: '' }
    // Ensure proper structure and normalize tasks to { text, done }
    const inputTasks = data.tasks || {}
    const tasks = {}
    Object.keys(inputTasks).forEach((k) => {
      const v = inputTasks[k]
      if (typeof v === 'string') {
        tasks[k] = { text: v, done: false }
      } else if (v && typeof v === 'object') {
        tasks[k] = { text: v.text || '', done: !!v.done }
      } else {
        tasks[k] = { text: '', done: false }
      }
    })
    callback({ tasks, note: data.note || '' })
  })
  return () => unsub()
}

export async function saveDay(userId, dateKey, data) {
  if (!db) return
  await set(child(root(userId), `days/${dateKey}`), data)
}

export function subscribeMonth(userId, monthKey, callback) {
  if (!db) {
    let cancelled = false
    setTimeout(() => {
      if (!cancelled) callback({ goals: [] })
    }, 0)
    return () => { cancelled = true }
  }
  const r = child(root(userId), `months/${monthKey}`)
  const unsub = onValue(r, (snap) => {
    const data = snap.exists() ? snap.val() : { goals: [] }
    const rawGoals = Array.isArray(data.goals) ? data.goals : []
    const goals = rawGoals.map((g) => {
      if (typeof g === 'string') return { text: g, done: false }
      if (g && typeof g === 'object') return { text: g.text || '', done: !!g.done }
      return { text: '', done: false }
    })
    callback({ goals })
  })
  return () => unsub()
}

export async function saveMonth(userId, monthKey, data) {
  if (!db) return
  await set(child(root(userId), `months/${monthKey}`), data)
}

// Weekly goals: users/<uid>/weeks/<weekKey>
export function subscribeWeek(userId, weekKey, callback) {
  if (!db) {
    let cancelled = false
    setTimeout(() => {
      if (!cancelled) callback({ goals: [] })
    }, 0)
    return () => { cancelled = true }
  }
  const r = child(root(userId), `weeks/${weekKey}`)
  const unsub = onValue(r, (snap) => {
    const data = snap.exists() ? snap.val() : { goals: [] }
    const rawGoals = Array.isArray(data.goals) ? data.goals : []
    const goals = rawGoals.map((g) => {
      if (typeof g === 'string') return { text: g, done: false }
      if (g && typeof g === 'object') return { text: g.text || '', done: !!g.done }
      return { text: '', done: false }
    })
    callback({ goals })
  })
  return () => unsub()
}

export async function saveWeek(userId, weekKey, data) {
  if (!db) return
  await set(child(root(userId), `weeks/${weekKey}`), data)
}

// Aggregation helpers for Pending page
export async function getAllDays(userId) {
  if (!db) return {}
  const snap = await get(child(root(userId), 'days'))
  return snap.exists() ? (snap.val() || {}) : {}
}

export async function getAllWeeks(userId) {
  if (!db) return {}
  const snap = await get(child(root(userId), 'weeks'))
  return snap.exists() ? (snap.val() || {}) : {}
}

export async function getAllMonths(userId) {
  if (!db) return {}
  const snap = await get(child(root(userId), 'months'))
  return snap.exists() ? (snap.val() || {}) : {}
}

// Live subscriptions for entire collections
export function subscribeAllDays(userId, callback) {
  if (!db) {
    let cancelled = false
    setTimeout(() => { if (!cancelled) callback({}) }, 0)
    return () => { cancelled = true }
  }
  const r = child(root(userId), 'days')
  const unsub = onValue(r, (snap) => {
    callback(snap.exists() ? (snap.val() || {}) : {})
  })
  return () => unsub()
}

export function subscribeAllWeeks(userId, callback) {
  if (!db) {
    let cancelled = false
    setTimeout(() => { if (!cancelled) callback({}) }, 0)
    return () => { cancelled = true }
  }
  const r = child(root(userId), 'weeks')
  const unsub = onValue(r, (snap) => {
    callback(snap.exists() ? (snap.val() || {}) : {})
  })
  return () => unsub()
}

export function subscribeAllMonths(userId, callback) {
  if (!db) {
    let cancelled = false
    setTimeout(() => { if (!cancelled) callback({}) }, 0)
    return () => { cancelled = true }
  }
  const r = child(root(userId), 'months')
  const unsub = onValue(r, (snap) => {
    callback(snap.exists() ? (snap.val() || {}) : {})
  })
  return () => unsub()
}

// Access key storage tied to email
function toEmailKey(email) {
  return String(email || '').toLowerCase().replace(/[.#$\[\]/]/g, '_')
}

export async function setAccessKeyForEmail(email, key, uid) {
  if (!db) return
  const k = toEmailKey(email)
  const r = ref(db, `accessKeys/${k}`)
  await set(r, { key, email, uid: uid || null, createdAt: Date.now(), validated: false, onceLogged: false })
}

export async function getAccessKeyForEmail(email) {
  if (!db) return null
  const k = toEmailKey(email)
  const r = ref(db, `accessKeys/${k}`)
  const snap = await get(r)
  return snap.exists() ? (snap.val() && snap.val().key) : null
}

export async function getAccessInfoForEmail(email) {
  if (!db) return null
  const k = toEmailKey(email)
  const r = ref(db, `accessKeys/${k}`)
  const snap = await get(r)
  return snap.exists() ? (snap.val() || null) : null
}

export async function setAccessValidatedForEmail(email, uid) {
  if (!db) return
  const k = toEmailKey(email)
  const r = ref(db, `accessKeys/${k}`)
  const snap = await get(r)
  const current = snap.exists() ? (snap.val() || {}) : {}
  await set(r, { ...current, validated: true, onceLogged: true, validatedAt: Date.now(), uid: uid || current.uid || null })
}
