import { ref, onValue, set, child, get } from 'firebase/database'
import { db } from '../firebase'

const root = (userId) => ref(db, `users/${userId}`)

export function subscribeDay(userId, dateKey, callback) {
  if (!db) {
    // fallback: no-op subscription returning default
    let cancelled = false
    setTimeout(() => {
      if (!cancelled) callback({ tasks: {} })
    }, 0)
    return () => { cancelled = true }
  }
  const r = child(root(userId), `days/${dateKey}`)
  const unsub = onValue(r, (snap) => {
    const data = snap.exists() ? snap.val() : { tasks: {} }
    // Ensure proper structure and normalize tasks to { text, done, cancelled }
    const inputTasks = data.tasks || {}
    const tasks = {}
    Object.keys(inputTasks).forEach((k) => {
      const v = inputTasks[k]
      if (typeof v === 'string') {
        tasks[k] = { text: v, done: false, cancelled: false }
      } else if (v && typeof v === 'object') {
        tasks[k] = { text: v.text || '', done: !!v.done, cancelled: !!v.cancelled }
      } else {
        tasks[k] = { text: '', done: false, cancelled: false }
      }
    })
    callback({ tasks })
  })
  return () => unsub()
}

export async function saveDay(userId, dateKey, data) {
  if (!db) return
  // Only save tasks, not notes
  await set(child(root(userId), `days/${dateKey}`), { tasks: data.tasks || {} })
}

export async function getDay(userId, dateKey) {
  if (!db) return { tasks: {} }
  const r = child(root(userId), `days/${dateKey}`)
  const snap = await get(r)
  if (!snap.exists()) return { tasks: {} }
  const data = snap.val()
  // Normalize tasks structure
  const inputTasks = data.tasks || {}
  const tasks = {}
  Object.keys(inputTasks).forEach((k) => {
    const v = inputTasks[k]
    if (typeof v === 'string') {
      tasks[k] = { text: v, done: false, cancelled: false }
    } else if (v && typeof v === 'object') {
      tasks[k] = { text: v.text || '', done: !!v.done, cancelled: !!v.cancelled }
    } else {
      tasks[k] = { text: '', done: false, cancelled: false }
    }
  })
  return { tasks }
}

export async function getWeek(userId, weekKey) {
  if (!db) return { goals: [] }
  const r = child(root(userId), `weeks/${weekKey}`)
  const snap = await get(r)
  if (!snap.exists()) return { goals: [] }
  const data = snap.val()
  const rawGoals = Array.isArray(data.goals) ? data.goals : []
  const goals = rawGoals.map((g) => {
    if (typeof g === 'string') return { text: g, done: false, cancelled: false }
    if (g && typeof g === 'object') return { text: g.text || '', done: !!g.done, cancelled: !!g.cancelled }
    return { text: '', done: false, cancelled: false }
  })
  return { goals }
}

export async function getMonth(userId, monthKey) {
  if (!db) return { goals: [] }
  const r = child(root(userId), `months/${monthKey}`)
  const snap = await get(r)
  if (!snap.exists()) return { goals: [] }
  const data = snap.val()
  const rawGoals = Array.isArray(data.goals) ? data.goals : []
  const goals = rawGoals.map((g) => {
    if (typeof g === 'string') return { text: g, done: false, cancelled: false }
    if (g && typeof g === 'object') return { text: g.text || '', done: !!g.done, cancelled: !!g.cancelled }
    return { text: '', done: false, cancelled: false }
  })
  return { goals }
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
      if (typeof g === 'string') return { text: g, done: false, cancelled: false }
      if (g && typeof g === 'object') return { text: g.text || '', done: !!g.done, cancelled: !!g.cancelled }
      return { text: '', done: false, cancelled: false }
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
      if (typeof g === 'string') return { text: g, done: false, cancelled: false }
      if (g && typeof g === 'object') return { text: g.text || '', done: !!g.done, cancelled: !!g.cancelled }
      return { text: '', done: false, cancelled: false }
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

// Notes section - separate from days
export function subscribeNote(userId, dateKey, callback) {
  if (!db) {
    let cancelled = false
    setTimeout(() => {
      if (!cancelled) callback('')
    }, 0)
    return () => { cancelled = true }
  }
  const r = child(root(userId), `notes/${dateKey}`)
  const unsub = onValue(r, (snap) => {
    const note = snap.exists() ? (snap.val() || '') : ''
    callback(typeof note === 'string' ? note : '')
  })
  return () => unsub()
}

export async function saveNote(userId, dateKey, note) {
  if (!db) return
  await set(child(root(userId), `notes/${dateKey}`), note || '')
}

export async function getNote(userId, dateKey) {
  if (!db) return ''
  const r = child(root(userId), `notes/${dateKey}`)
  const snap = await get(r)
  if (!snap.exists()) return ''
  const note = snap.val()
  return typeof note === 'string' ? note : ''
}

export async function getAllNotes(userId) {
  if (!db) return {}
  const snap = await get(child(root(userId), 'notes'))
  return snap.exists() ? (snap.val() || {}) : {}
}

export function subscribeAllNotes(userId, callback) {
  if (!db) {
    let cancelled = false
    setTimeout(() => { if (!cancelled) callback({}) }, 0)
    return () => { cancelled = true }
  }
  const r = child(root(userId), 'notes')
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
