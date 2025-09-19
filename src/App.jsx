import { useEffect, useMemo, useRef, useState } from 'react'
import { subscribeDay, saveDay, subscribeMonth, saveMonth, subscribeWeek, saveWeek, getAllDays, getAllWeeks, getAllMonths, subscribeAllDays, subscribeAllWeeks, subscribeAllMonths } from './services/realtime'
import { onAuthChange, logout } from './services/auth'
import Login from './components/Login'
import './App.css'

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDateKey(date) {
  const d = startOfDay(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatMonthKey(date) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function startOfWeek(date) {
  const d = new Date(date)
  const jsDay = d.getDay() // 0..6 (Sun..Sat)
  const mondayIndex = (jsDay + 6) % 7 // 0 for Monday, 6 for Sunday
  const start = new Date(d)
  start.setDate(d.getDate() - mondayIndex)
  start.setHours(0,0,0,0)
  return start
}

function formatWeekKey(date) {
  const s = startOfWeek(date)
  const y = s.getFullYear()
  const m = String(s.getMonth() + 1).padStart(2, '0')
  const day = String(s.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}` // Monday-start date identifies the week
}

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })
  // Re-read when the key changes (e.g., different user uid)
  useEffect(() => {
    try {
      const item = localStorage.getItem(key)
      setValue(item ? JSON.parse(item) : initialValue)
    } catch {
      setValue(initialValue)
    }
  }, [key])
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value])
  return [value, setValue]
}

function CalendarMini({ date, onChange, isMobile = false }) {
  const today = new Date()
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
  const startWeekday = monthStart.getDay()
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  const todayKey = formatDateKey(today)
  const currentKey = formatDateKey(date)
  const selectedIndex = startWeekday + (date.getDate() - 1)
  const weekRowStart = Math.floor(selectedIndex / 7) * 7
  const weekRowEnd = weekRowStart + 6
  return (
    <div className="calendar-mini">
      <div className="calendar-mini-header">
        <button 
          className="btn" 
          onClick={() => onChange(new Date(date.getFullYear(), date.getMonth() - 1, Math.min(date.getDate(), 28)))}
          style={{ 
            padding: isMobile ? '4px 8px' : '6px 10px',
            fontSize: isMobile ? '12px' : '14px'
          }}
        >
          ◀
        </button>
        <div className="month-label" style={{ fontSize: isMobile ? '12px' : '14px' }}>
          {date.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </div>
        <button 
          className="btn" 
          onClick={() => onChange(new Date(date.getFullYear(), date.getMonth() + 1, Math.min(date.getDate(), 28)))}
          style={{ 
            padding: isMobile ? '4px 8px' : '6px 10px',
            fontSize: isMobile ? '12px' : '14px'
          }}
        >
          ▶
        </button>
      </div>
      <div className="calendar-grid select-none">
        {['S','M','T','W','T','F','S'].map((d) => (
          <div key={d} className="dow" style={{ fontSize: isMobile ? '10px' : '12px' }}>{d}</div>
        ))}
        {cells.map((d, idx) => {
          const isToday = d && formatDateKey(new Date(date.getFullYear(), date.getMonth(), d)) === todayKey
          const isSelected = d && formatDateKey(new Date(date.getFullYear(), date.getMonth(), d)) === currentKey
          const inSelectedWeekRow = idx >= weekRowStart && idx <= weekRowEnd
          const isStartOfWeekRow = idx === weekRowStart
          const isEndOfWeekRow = idx === weekRowEnd
          return (
            <button
              key={idx}
              disabled={!d}
              onClick={() => d && onChange(new Date(date.getFullYear(), date.getMonth(), d))}
              className={`calendar-cell ${isSelected ? 'calendar-selected' : ''} ${inSelectedWeekRow ? 'week-row' : ''} ${isStartOfWeekRow ? 'week-row-start' : ''} ${isEndOfWeekRow ? 'week-row-end' : ''}`}
              style={{
                height: isMobile ? '28px' : '32px',
                fontSize: isMobile ? '11px' : '12px'
              }}
            >
              <span className={`${isToday ? 'calendar-today' : ''}`}>
                {d || ''}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CalendarPicker({ date, onChange }) {
  return (
    <div className="toolbar">
      <button className="btn" onClick={() => onChange(new Date(date.getFullYear(), date.getMonth() - 1, date.getDate()))}>◀</button>
      <div className="month-label">
        {date.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
      </div>
      <button className="btn" onClick={() => onChange(new Date(date.getFullYear(), date.getMonth() + 1, date.getDate()))}>▶</button>
      <input
        type="date"
        className="input"
        value={formatDateKey(date)}
        onChange={(e) => onChange(new Date(e.target.value))}
      />
    </div>
  )
}

function DigitalClock({ isMobile = false }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="clock" style={{ fontSize: isMobile ? '20px' : '28px' }}>
      {now.toLocaleTimeString([], { hour12: false })}
    </div>
  )
}

function DailyTable({ dateKey, tasks, onChange, isMobile = false }) {
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), [])
  return (
    <div className="table">
      <div className="table-head" style={{ 
        gridTemplateColumns: isMobile ? '60px 1fr' : '100px 1fr',
        fontSize: isMobile ? '11px' : '12px'
      }}>
        <div className="table-hour">Hour</div>
        <div className="table-task">Task</div>
      </div>
      <div style={{ maxHeight: isMobile ? '400px' : '300px', overflow: 'auto' }}>
        {hours.map((h) => (
          <div key={h} className="table-row" style={{ 
            gridTemplateColumns: isMobile ? '60px 1fr' : '100px 1fr'
          }}>
            <div className="table-hour table-cell" style={{ 
              fontSize: isMobile ? '11px' : '12px',
              padding: isMobile ? '8px 6px' : '10px'
            }}>
              {String(h).padStart(2, '0')}:00
            </div>
            <div className="table-task table-cell" style={{ 
              padding: isMobile ? '8px 6px' : '10px'
            }}>
              <div style={{ 
                display: 'flex', 
                gap: isMobile ? '6px' : '8px', 
                alignItems: 'flex-start' 
              }}>
                <input
                  type="checkbox"
                  checked={!!(tasks[h]?.done)}
                  onChange={(e) => {
                    const current = tasks[h] || { text: '', done: false }
                    onChange({ ...tasks, [h]: { ...current, done: e.target.checked } })
                  }}
                  style={{ 
                    marginTop: isMobile ? '4px' : '6px',
                    width: isMobile ? '14px' : '16px',
                    height: isMobile ? '14px' : '16px'
                  }}
                />
                <textarea
                  value={(tasks[h]?.text) || ''}
                  onChange={(e) => {
                    const current = tasks[h] || { text: '', done: false }
                    onChange({ ...tasks, [h]: { ...current, text: e.target.value } })
                  }}
                  placeholder="Add task..."
                  rows={isMobile ? 1 : 2}
                  className="task-input"
                  style={{
                    fontSize: isMobile ? '12px' : '14px',
                    padding: isMobile ? '6px' : '8px',
                    minHeight: isMobile ? '32px' : '44px'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MonthlyGoals({ monthKey, goals, onChange, onPrev, onNext, isMobile = false }) {
  return (
    <div>
      <div className="calendar-mini-header">
        <button 
          className="btn" 
          onClick={onPrev}
          style={{ 
            padding: isMobile ? '4px 8px' : '6px 10px',
            fontSize: isMobile ? '12px' : '14px'
          }}
        >
          ◀
        </button>
        <div className="month-label" style={{ fontSize: isMobile ? '12px' : '14px' }}>
          {monthKey}
        </div>
        <button 
          className="btn" 
          onClick={onNext}
          style={{ 
            padding: isMobile ? '4px 8px' : '6px 10px',
            fontSize: isMobile ? '12px' : '14px'
          }}
        >
          ▶
        </button>
      </div>
      <div className="goals">
        {(goals && goals.length ? goals : [{ text: '' , done: false }]).map((g, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            gap: isMobile ? '6px' : '8px', 
            alignItems: 'center',
            marginBottom: isMobile ? '6px' : '8px'
          }}>
            <input
              type="checkbox"
              checked={!!g?.done}
              onChange={(e) => {
                const next = (goals && goals.length ? goals.slice() : [{ text: '' , done: false }])
                next[i] = { text: g?.text || '', done: e.target.checked }
                onChange(next)
              }}
              style={{
                width: isMobile ? '14px' : '16px',
                height: isMobile ? '14px' : '16px'
              }}
            />
            <input
            key={i}
            className="goal-input"
            placeholder={`Goal ${i + 1}`}
            value={(g?.text) || ''}
            onChange={(e) => {
              const next = goals && goals.length ? goals.slice() : [{ text: '' , done: false }]
              next[i] = { text: e.target.value, done: !!g?.done }
              onChange(next)
            }}
            style={{
              fontSize: isMobile ? '12px' : '14px',
              padding: isMobile ? '8px' : '10px'
            }}
          />
          </div>
        ))}
        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '6px' : '8px', 
          marginTop: '8px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <button
            className="btn"
            onClick={() => {
              const base = (goals && goals.length) ? goals : [{ text: '', done: false }]
              onChange([...base, { text: '', done: false }])
            }}
            style={{
              padding: isMobile ? '8px 12px' : '6px 10px',
              fontSize: isMobile ? '12px' : '14px'
            }}
          >
            + Add Goal
          </button>
          <button 
            className="btn" 
            onClick={() => goals && goals.length ? onChange(goals.slice(0, -1)) : null} 
            disabled={!goals || goals.length === 0}
            style={{
              padding: isMobile ? '8px 12px' : '6px 10px',
              fontSize: isMobile ? '12px' : '14px'
            }}
          >
            - Remove Goal
          </button>
        </div>
      </div>
    </div>
  )
}

function WeeklyGoals({ weekKey, goals, onChange, onPrev, onNext, isMobile = false }) {
  return (
    <div>
      <div className="calendar-mini-header" style={{ gap: isMobile ? '6px' : '8px' }}>
        <button 
          className="btn" 
          onClick={onPrev}
          style={{ 
            padding: isMobile ? '4px 8px' : '6px 10px',
            fontSize: isMobile ? '12px' : '14px'
          }}
        >
          ◀
        </button>
        <div className="week-header-inner" style={{ 
          padding: isMobile ? '4px 8px' : '6px 10px',
          fontSize: isMobile ? '10px' : '12px'
        }}>
          <div className="pill-lg" style={{ fontSize: isMobile ? '10px' : '12px' }}>Mon–Sun</div>
          <div className="pill-lg" style={{ fontSize: isMobile ? '10px' : '12px' }}>Start: {weekKey}</div>
        </div>
        <button 
          className="btn" 
          onClick={onNext}
          style={{ 
            padding: isMobile ? '4px 8px' : '6px 10px',
            fontSize: isMobile ? '12px' : '14px'
          }}
        >
          ▶
        </button>
      </div>
      <div className="goal-list">
        {(goals && goals.length ? goals : [{ text: '' , done: false }]).map((g, i) => (
          <div key={i} className="goal-item" style={{
            padding: isMobile ? '8px' : '10px',
            marginBottom: isMobile ? '6px' : '8px'
          }}>
            <input
              type="checkbox"
              checked={!!g?.done}
              onChange={(e) => {
                const next = (goals && goals.length ? goals.slice() : [{ text: '' , done: false }])
                next[i] = { text: g?.text || '', done: e.target.checked }
                onChange(next)
              }}
              style={{
                width: isMobile ? '14px' : '16px',
                height: isMobile ? '14px' : '16px'
              }}
            />
            <input
              key={i}
              className="goal-input"
              placeholder={`Weekly Goal ${i + 1}`}
              value={(g?.text) || ''}
              onChange={(e) => {
                const next = goals && goals.length ? goals.slice() : [{ text: '' , done: false }]
                next[i] = { text: e.target.value, done: !!g?.done }
                onChange(next)
              }}
              style={{
                fontSize: isMobile ? '12px' : '14px',
                padding: isMobile ? '8px' : '10px'
              }}
            />
          </div>
        ))}
        <div className="goal-actions" style={{ 
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '6px' : '8px'
        }}>
          <button
            className="btn"
            onClick={() => {
              const base = (goals && goals.length) ? goals : [{ text: '', done: false }]
              onChange([...base, { text: '', done: false }])
            }}
            style={{
              padding: isMobile ? '8px 12px' : '6px 10px',
              fontSize: isMobile ? '12px' : '14px'
            }}
          >
            + Add Goal
          </button>
          <button 
            className="btn" 
            onClick={() => goals && goals.length ? onChange(goals.slice(0, -1)) : null} 
            disabled={!goals || goals.length === 0}
            style={{
              padding: isMobile ? '8px 12px' : '6px 10px',
              fontSize: isMobile ? '12px' : '14px'
            }}
          >
            - Remove Goal
          </button>
        </div>
      </div>
    </div>
  )
}

// Add NotesTab component to show all notes with their dates
function NotesTab({ dailyNotes }) {
  // Sort notes by date descending
  const notesArray = Object.entries(dailyNotes)
    .filter(([date, note]) => note && note.trim() !== '')
    .sort((a, b) => b[0].localeCompare(a[0]))

  return (
    <div style={{
      backgroundColor: '#111116',
      border: '1px solid #22222a',
      borderRadius: '14px',
      padding: '24px',
      minHeight: '300px'
    }}>
      <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#e6e6e9' }}>📝 All Notes</h2>
      {notesArray.length === 0 ? (
        <div style={{ color: '#c7c7cb', fontSize: '15px' }}>No notes found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {notesArray.map(([date, note]) => (
            <div key={date} style={{
              backgroundColor: '#18181b',
              borderRadius: '10px',
              padding: '16px',
              border: '1px solid #22222a'
            }}>
              <div style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>
                {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div style={{ fontSize: '15px', color: '#e6e6e9', whiteSpace: 'pre-line' }}>
                {note}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [suppressDashboard, setSuppressDashboard] = useState(() => {
    try { return sessionStorage.getItem('suppressDashboard') === '1' } catch { return false }
  })
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [pendingFilter, setPendingFilter] = useState('All')
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [now, setNow] = useState(() => new Date())
  const [allPending, setAllPending] = useState({ daily: [], weekly: [], monthly: [] })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  // Pending page UI controls
  const [isDailyOpen, setIsDailyOpen] = useState(true)
  const [isWeeklyOpen, setIsWeeklyOpen] = useState(true)
  const [isMonthlyOpen, setIsMonthlyOpen] = useState(true)
  const dateKey = formatDateKey(selectedDate)
  const monthKey = formatMonthKey(selectedDate)
  const weekKey = formatWeekKey(selectedDate)
  const prevUidRef = useRef(null)

  // Namespace all persisted data by user uid to isolate users
  const storageNamespace = user?.uid ? `uid:${user.uid}` : 'guest'
  const [dailyNotes, setDailyNotes] = useLocalStorage(`dailyNotes:${storageNamespace}`, {})
  const [dailyTasks, setDailyTasks] = useLocalStorage(`dailyTasks:${storageNamespace}`, {})
  const [monthlyGoals, setMonthlyGoals] = useLocalStorage(`monthlyGoals:${storageNamespace}`, {})
  const [weeklyGoals, setWeeklyGoals] = useLocalStorage(`weeklyGoals:${storageNamespace}`, {})

  // Mobile detection and responsive handling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  // Simple auth state management
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      console.log('Auth state changed:', user)
      setUser(user)
      setAuthReady(true)
      try {
        const sup = sessionStorage.getItem('suppressDashboard') === '1'
        setSuppressDashboard(!!sup)
        if (!user && sup) {
          sessionStorage.removeItem('suppressDashboard')
          setSuppressDashboard(false)
        }
      } catch {}
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleSave = () => {
    if (!user?.uid) return
    const dayData = { tasks: dailyTasks[dateKey] || {}, note: dailyNotes[dateKey] || '' }
    saveDay(user.uid, dateKey, dayData).catch(() => {})
    saveMonth(user.uid, monthKey, { goals: monthlyGoals[monthKey] || [] }).catch(() => {})
    saveWeek(user.uid, weekKey, { goals: weeklyGoals[weekKey] || [] }).catch(() => {})
    console.log('Data saved!')
  }

  const handleClearCurrent = () => {
    // Clear only UI/local state for current date/week/month
    setDailyNotes((prev) => ({ ...prev, [dateKey]: '' }))
    setDailyTasks((prev) => ({ ...prev, [dateKey]: {} }))
  }

  // Live clock for pending cutoff (update every minute)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const today = now
  const todayDateKey = formatDateKey(today)
  const todayWeekKey = formatWeekKey(today)
  const todayMonthKey = formatMonthKey(today)
  const currentHour = today.getHours()

  // Aggregate all past pending items across dates/weeks/months for the current user
  useEffect(() => {
    let unsubDays = null
    let unsubWeeks = null
    let unsubMonths = null
    const connect = () => {
      if (!user?.uid) { setAllPending({ daily: [], weekly: [], monthly: [] }); return }
      const handleUpdate = (days, weeks, months) => {
        const todayKey = formatDateKey(today)
        const thisWeekKey = formatWeekKey(today)
        const thisMonthKey = formatMonthKey(today)

        // Daily: include tasks from days strictly before today
        const daily = []
        Object.entries(days || {}).forEach(([dKey, data]) => {
          if (dKey < todayKey) {
            const tasksMap = (data && data.tasks) || {}
            Object.entries(tasksMap).forEach(([h, v]) => {
              const done = !!(v && v.done)
              const text = (v && v.text) || ''
              if (!done && text.trim() !== '') {
                const hourNum = Number(h)
                daily.push({ dateKey: dKey, hour: hourNum, text })
              }
            })
          }
        })
        daily.sort((a, b) => (a.dateKey.localeCompare(b.dateKey) || a.hour - b.hour))

        // Weekly: include goals for weeks that start before the current week
        const weekly = []
        Object.entries(weeks || {}).forEach(([wKey, data]) => {
          if (wKey < thisWeekKey) {
            const goals = Array.isArray(data?.goals) ? data.goals : []
            goals.forEach((g, idx) => {
              const text = (g && g.text) || ''
              const done = !!(g && g.done)
              if (!done && text.trim() !== '') weekly.push({ weekKey: wKey, index: idx, text })
            })
          }
        })
        weekly.sort((a, b) => a.weekKey.localeCompare(b.weekKey))

        // Monthly: include goals for months strictly before the current month
        const monthly = []
        Object.entries(months || {}).forEach(([mKey, data]) => {
          if (mKey < thisMonthKey) {
            const goals = Array.isArray(data?.goals) ? data.goals : []
            goals.forEach((g, idx) => {
              const text = (g && g.text) || ''
              const done = !!(g && g.done)
              if (!done && text.trim() !== '') monthly.push({ monthKey: mKey, index: idx, text })
            })
          }
        })
        monthly.sort((a, b) => a.monthKey.localeCompare(b.monthKey))

        setAllPending({ daily, weekly, monthly })
      }
      let latestDays = {}
      let latestWeeks = {}
      let latestMonths = {}
      const maybeEmit = () => handleUpdate(latestDays, latestWeeks, latestMonths)
      unsubDays = subscribeAllDays(user.uid, (d) => { latestDays = d || {}; maybeEmit() })
      unsubWeeks = subscribeAllWeeks(user.uid, (w) => { latestWeeks = w || {}; maybeEmit() })
      unsubMonths = subscribeAllMonths(user.uid, (m) => { latestMonths = m || {}; maybeEmit() })
    }
    connect()
    return () => { unsubDays && unsubDays(); unsubWeeks && unsubWeeks(); unsubMonths && unsubMonths() }
  }, [user?.uid, today])

  // Pending computations for TODAY only; daily limited to current hour or earlier
  const pendingDaily = useMemo(() => {
    const tasksForDay = dailyTasks[todayDateKey] || {}
    return Object.entries(tasksForDay)
      .filter(([h, v]) => {
        const hourNum = Number(h)
        return hourNum <= currentHour && v && typeof v === 'object' && !v.done && (v.text || '').trim() !== ''
      })
      .map(([hour, v]) => ({ hour: Number(hour), text: v.text }))
      .sort((a, b) => a.hour - b.hour)
  }, [dailyTasks, todayDateKey, currentHour])

  const pendingWeekly = useMemo(() => {
    const goals = weeklyGoals[todayWeekKey] || []
    return goals
      .map((g, idx) => ({ index: idx, text: g?.text || '', done: !!g?.done }))
      .filter((g) => !g.done && g.text.trim() !== '')
  }, [weeklyGoals, todayWeekKey])

  const pendingMonthly = useMemo(() => {
    const goals = monthlyGoals[todayMonthKey] || []
    return goals
      .map((g, idx) => ({ index: idx, text: g?.text || '', done: !!g?.done }))
      .filter((g) => !g.done && g.text.trim() !== '')
  }, [monthlyGoals, todayMonthKey])

  const totalPendingCount =
    (pendingDaily?.length || 0) + (allPending.daily?.length || 0) +
    (pendingWeekly?.length || 0) + (allPending.weekly?.length || 0) +
    (pendingMonthly?.length || 0) + (allPending.monthly?.length || 0)

  const toggleDailyDone = (hour) => {
    const current = dailyTasks[todayDateKey] || {}
    const entry = current[hour] || { text: '', done: false }
    const next = { ...current, [hour]: { ...entry, done: true } }
    setDailyTasks((prev) => ({ ...prev, [todayDateKey]: next }))
    if (user?.uid) {
      const dayData = { tasks: next, note: dailyNotes[todayDateKey] || '' }
      saveDay(user.uid, todayDateKey, dayData).catch(() => {})
    }
  }

  const toggleWeeklyDone = (index) => {
    const list = (weeklyGoals[todayWeekKey] || []).slice()
    const g = list[index] || { text: '', done: false }
    list[index] = { ...g, done: true }
    setWeeklyGoals((prev) => ({ ...prev, [todayWeekKey]: list }))
    if (user?.uid) {
      saveWeek(user.uid, todayWeekKey, { goals: list }).catch(() => {})
    }
  }

  const toggleMonthlyDone = (index) => {
    const list = (monthlyGoals[todayMonthKey] || []).slice()
    const g = list[index] || { text: '', done: false }
    list[index] = { ...g, done: true }
    setMonthlyGoals((prev) => ({ ...prev, [todayMonthKey]: list }))
    if (user?.uid) {
      saveMonth(user.uid, todayMonthKey, { goals: list }).catch(() => {})
    }
  }

  // Subscribe to realtime updates for the current user/date/month
  useEffect(() => {
    if (!user?.uid) return
    const unsubDay = subscribeDay(user.uid, dateKey, (data) => {
      setDailyNotes((prev) => ({ ...prev, [dateKey]: data.note || '' }))
      setDailyTasks((prev) => ({ ...prev, [dateKey]: data.tasks || {} }))
    })
    const unsubMonth = subscribeMonth(user.uid, monthKey, (data) => {
      const goals = Array.isArray(data.goals) ? data.goals : Array(6).fill('')
      setMonthlyGoals((prev) => ({ ...prev, [monthKey]: goals }))
    })
    const unsubWeek = subscribeWeek(user.uid, weekKey, (data) => {
      const goals = Array.isArray(data.goals) ? data.goals : Array(6).fill('')
      setWeeklyGoals((prev) => ({ ...prev, [weekKey]: goals }))
    })
    return () => {
      unsubDay && unsubDay()
      unsubMonth && unsubMonth()
      unsubWeek && unsubWeek()
    }
  }, [user?.uid, dateKey, monthKey, weekKey])

  // Remove previous user's cached localStorage data when account changes or logs out
  useEffect(() => {
    const prevUid = prevUidRef.current
    const nextUid = user?.uid || null
    if (prevUid && prevUid !== nextUid) {
      try {
        localStorage.removeItem(`dailyNotes:uid:${prevUid}`)
        localStorage.removeItem(`dailyTasks:uid:${prevUid}`)
        localStorage.removeItem(`monthlyGoals:uid:${prevUid}`)
        localStorage.removeItem(`weeklyGoals:uid:${prevUid}`)
      } catch {}
    }
    prevUidRef.current = nextUid
  }, [user?.uid])

  // SIMPLE FALLBACK - ALWAYS SHOW SOMETHING
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0b0b0f', 
      color: '#e6e6e9',
      padding: '20px'
    }}>
      {!authReady || !user || suppressDashboard ? (
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Login />
        </div>
      ) : (
        <div>
          {/* Top Navigation Bar */}
          <div className="mobile-menu-container" style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backgroundColor: '#0b0b0f',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              border: '1px solid #22222a',
              borderRadius: '14px',
              padding: isMobile ? '8px 12px' : '10px 14px',
              backgroundColor: '#111116'
            }}>
              {/* Brand */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: isMobile ? '24px' : '28px', 
                  height: isMobile ? '24px' : '28px', 
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)'
                }} />
                <div style={{ 
                  fontWeight: 700, 
                  fontSize: isMobile ? '14px' : '16px',
                  display: isMobile ? 'none' : 'block'
                }}>
                  To‑Do Dashboard
                </div>
                {isMobile && (
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>
                    To‑Do
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              {isMobile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{
                      backgroundColor: '#22222a',
                      border: '1px solid #333',
                      color: '#e6e6e9',
                      padding: '8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    ☰
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop Tabs */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Dashboard',`Pending (${totalPendingCount})`,'Notes','Analytics','Settings'].map((tabLabel) => {
                      const tab = tabLabel.startsWith('Pending') ? 'Pending' : tabLabel
                      const isActive = activeTab === tab
                      return (
                        <button
                          key={tabLabel}
                          className="btn"
                          onClick={() => setActiveTab(tab)}
                          style={{
                            border: '1px solid #22222a',
                            backgroundColor: isActive ? '#22222a' : '#14141b',
                            color: '#e6e6e9',
                            padding: '8px 12px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          {tabLabel}
                        </button>
                      )
                    })}
                  </div>

                  {/* Desktop User + Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#c7c7cb' }}>{user?.email}</div>
                    <button 
                      onClick={handleClearCurrent}
                      style={{ 
                        backgroundColor: '#374151', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 12px', 
                        borderRadius: '8px', 
                        cursor: 'pointer'
                      }}
                    >
                      Clear
                    </button>
                    <button 
                      onClick={handleSave}
                      style={{ 
                        backgroundColor: '#6366f1', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 12px', 
                        borderRadius: '8px', 
                        cursor: 'pointer'
                      }}
                    >
                      Save
                    </button>
                    <button 
                      onClick={handleLogout}
                      style={{ 
                        backgroundColor: '#ef4444', 
                        color: 'white', 
                        border: 'none', 
                        padding: '8px 12px', 
                        borderRadius: '8px', 
                        cursor: 'pointer'
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobile && isMobileMenuOpen && (
              <>
                {/* Backdrop */}
                <div 
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    zIndex: 99
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                {/* Menu */}
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '12px',
                  right: '12px',
                  backgroundColor: '#111116',
                  border: '1px solid #22222a',
                  borderRadius: '12px',
                  marginTop: '8px',
                  padding: '16px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  zIndex: 100
                }}>
                {/* Mobile Tabs */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>Navigation</div>
                  {['Dashboard',`Pending (${totalPendingCount})`,'Notes','Analytics','Settings'].map((tabLabel) => {
                    const tab = tabLabel.startsWith('Pending') ? 'Pending' : tabLabel
                    const isActive = activeTab === tab
                    return (
                      <button
                        key={tabLabel}
                        onClick={() => {
                          setActiveTab(tab)
                          setIsMobileMenuOpen(false)
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          backgroundColor: isActive ? '#22222a' : 'transparent',
                          color: '#e6e6e9',
                          border: 'none',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          marginBottom: '4px'
                        }}
                      >
                        {tabLabel}
                      </button>
                    )
                  })}
                </div>

                {/* Mobile User Info */}
                <div style={{ 
                  borderTop: '1px solid #22222a', 
                  paddingTop: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '14px', color: '#a1a1aa', marginBottom: '8px' }}>Account</div>
                  <div style={{ fontSize: '12px', color: '#c7c7cb', marginBottom: '12px' }}>
                    {user?.email}
                  </div>
                </div>

                {/* Mobile Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    onClick={() => {
                      handleClearCurrent()
                      setIsMobileMenuOpen(false)
                    }}
                    style={{ 
                      backgroundColor: '#374151', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px 16px', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Clear Current
                  </button>
                  <button 
                    onClick={() => {
                      handleSave()
                      setIsMobileMenuOpen(false)
                    }}
                    style={{ 
                      backgroundColor: '#6366f1', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px 16px', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Save Data
                  </button>
                  <button 
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    style={{ 
                      backgroundColor: '#ef4444', 
                      color: 'white', 
                      border: 'none', 
                      padding: '12px 16px', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Logout
                  </button>
                </div>
                </div>
              </>
            )}
          </div>
          
          {/* Main App Content */}
          {activeTab === 'Dashboard' ? (
          <div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1fr 3fr', 
            gap: isMobile ? '16px' : '20px' 
          }}>
            {/* Left Sidebar */}
            <div style={{ order: isMobile ? 2 : 1 }}>
              {/* Calendar */}
              <div style={{ 
                backgroundColor: '#111116', 
                border: '1px solid #22222a', 
                borderRadius: '14px', 
                padding: isMobile ? '12px' : '16px', 
                marginBottom: '16px' 
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '14px' : '16px', 
                  color: '#e6e6e9' 
                }}>
                  📅 Calendar
                </h3>
                <CalendarMini date={selectedDate} onChange={setSelectedDate} isMobile={isMobile} />
              </div>
              
              {/* Digital Clock */}
              <div style={{ 
                backgroundColor: '#111116', 
                border: '1px solid #22222a', 
                borderRadius: '14px', 
                padding: isMobile ? '12px' : '16px', 
                marginBottom: '16px' 
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '14px' : '16px', 
                  color: '#e6e6e9' 
                }}>
                  🕐 Live Time
                </h3>
                <DigitalClock isMobile={isMobile} />
              </div>

              {/* Weekly Goals */}
              <div style={{ 
                backgroundColor: '#111116', 
                border: '1px solid #22222a', 
                borderRadius: '14px', 
                padding: isMobile ? '12px' : '16px', 
                marginBottom: '16px' 
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '14px' : '16px', 
                  color: '#e6e6e9' 
                }}>
                  📅 Weekly Goals
                </h3>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  marginBottom: '8px' 
                }}>
                  <button
                    className="btn"
                    onClick={() => setWeeklyGoals((prev) => ({ ...prev, [weekKey]: [] }))}
                    style={{ 
                      backgroundColor: '#374151', 
                      color: '#e6e6e9', 
                      border: '1px solid #22222a', 
                      padding: isMobile ? '4px 8px' : '6px 10px', 
                      borderRadius: '8px',
                      fontSize: isMobile ? '12px' : '14px'
                    }}
                  >
                    Clear Week
                  </button>
                </div>
                <WeeklyGoals
                  weekKey={weekKey}
                  goals={weeklyGoals[weekKey] || []}
                  onChange={(goals) => setWeeklyGoals({ ...weeklyGoals, [weekKey]: goals })}
                  onPrev={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 7))}
                  onNext={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 7))}
                  isMobile={isMobile}
                />
              </div>
              
              {/* Monthly Goals */}
              <div style={{ 
                backgroundColor: '#111116', 
                border: '1px solid #22222a', 
                borderRadius: '14px', 
                padding: isMobile ? '12px' : '16px' 
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '14px' : '16px', 
                  color: '#e6e6e9' 
                }}>
                  🎯 Monthly Goals
                </h3>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  marginBottom: '8px' 
                }}>
                  <button
                    className="btn"
                    onClick={() => setMonthlyGoals((prev) => ({ ...prev, [monthKey]: [] }))}
                    style={{ 
                      backgroundColor: '#374151', 
                      color: '#e6e6e9', 
                      border: '1px solid #22222a', 
                      padding: isMobile ? '4px 8px' : '6px 10px', 
                      borderRadius: '8px',
                      fontSize: isMobile ? '12px' : '14px'
                    }}
                  >
                    Clear Month
                  </button>
                </div>
                <MonthlyGoals
                  monthKey={monthKey}
                  goals={monthlyGoals[monthKey] || []}
                  onChange={(goals) => setMonthlyGoals({ ...monthlyGoals, [monthKey]: goals })}
                  onPrev={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                  onNext={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                  isMobile={isMobile}
                />
              </div>
            </div>
            
            {/* Main Content */}
            <div style={{ order: isMobile ? 1 : 2 }}>
              <div style={{ 
                fontSize: isMobile ? '16px' : '18px', 
                fontWeight: '600', 
                marginBottom: '16px' 
              }}>
                {selectedDate.toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              
              {/* Daily Note Section */}
              <div style={{ 
                backgroundColor: '#111116', 
                border: '1px solid #22222a', 
                borderRadius: '14px', 
                padding: isMobile ? '12px' : '16px', 
                marginBottom: '20px' 
              }}>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: isMobile ? '14px' : '16px', 
                  color: '#e6e6e9' 
                }}>
                  📝 Daily Target Note
                </h3>
                <textarea
                  value={dailyNotes[dateKey] || ''}
                  onChange={(e) => setDailyNotes({ ...dailyNotes, [dateKey]: e.target.value })}
                  placeholder="Add your daily target or main focus for today..."
                  rows={isMobile ? 2 : 3}
                  style={{
                    width: '100%',
                    backgroundColor: '#0b0b0f',
                    border: '1px solid #22222a',
                    borderRadius: '8px',
                    padding: isMobile ? '10px' : '12px',
                    color: '#e6e6e9',
                    fontSize: isMobile ? '13px' : '14px',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                />
              </div>
              
              {/* Daily Tasks Table */}
              <div style={{ 
                backgroundColor: '#111116', 
                border: '1px solid #22222a', 
                borderRadius: '14px', 
                padding: isMobile ? '12px' : '16px' 
              }}>
                <h3 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: isMobile ? '14px' : '16px', 
                  color: '#e6e6e9' 
                }}>
                  ⏰ Hourly Tasks
                </h3>
                <DailyTable 
                  dateKey={dateKey} 
                  tasks={dailyTasks[dateKey] || {}} 
                  onChange={(tasks) => setDailyTasks({ ...dailyTasks, [dateKey]: tasks })} 
                  isMobile={isMobile}
                />
              </div>
            </div>
          </div>

          {/* Save Button moved to navbar */}
          </div>
          ) : activeTab === 'Pending' ? (
            <div>
              {/* Mobile segmented filter + Desktop select */}
              <div style={{ marginBottom: '12px' }}>
                {isMobile ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                    {['All','Daily','Weekly','Monthly'].map((label) => {
                      const active = pendingFilter === label
                      return (
                        <button
                          key={label}
                          onClick={() => setPendingFilter(label)}
                          style={{
                            backgroundColor: active ? '#22222a' : '#14141b',
                            color: '#e6e6e9',
                            border: '1px solid #22222a',
                            padding: '8px 10px',
                            borderRadius: '10px',
                            fontSize: '12px'
                          }}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <select className="input" value={pendingFilter} onChange={(e) => setPendingFilter(e.target.value)} style={{ backgroundColor: '#0b0b0f', color: '#e6e6e9', border: '1px solid #22222a', borderRadius: '8px', padding: '6px 10px' }}>
                      <option>All</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                )}
              </div>

              {(pendingFilter === 'All' || pendingFilter === 'Daily') && (
                <div style={{ backgroundColor: '#111116', border: '1px solid #22222a', borderRadius: '14px', padding: isMobile ? '12px' : '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="pill-lg">Daily</div>
                      <div className="pill">{(pendingDaily.length) + (allPending.daily.length)} items</div>
                    </div>
                    <button className="btn" onClick={() => setIsDailyOpen(!isDailyOpen)} style={{ padding: isMobile ? '6px 10px' : '8px 12px', fontSize: isMobile ? '12px' : '13px' }}>{isDailyOpen ? 'Hide' : 'Show'}</button>
                  </div>

                  {isDailyOpen && (
                    <div className="table">
                      <div className="table-head" style={{ display: isMobile ? 'none' : 'grid', gridTemplateColumns: '70px 140px 80px 1fr', gap: '8px', alignItems: 'center' }}>
                        <div className="table-hour">Done</div>
                        <div className="table-hour">Date</div>
                        <div className="table-hour">Hour</div>
                        <div className="table-task">Task</div>
                      </div>
                      <div className="table-body">
                        {[...allPending.daily, ...pendingDaily.map((t) => ({ dateKey: todayDateKey, hour: t.hour, text: t.text }))].map((t, i) => (
                          <div key={`d-${t.dateKey}-${t.hour}-${i}`} className="table-row" style={{ 
                            display: 'grid', 
                            gridTemplateColumns: isMobile ? '60px 1fr' : '70px 140px 80px 1fr', 
                            gap: '8px', 
                            alignItems: 'center'
                          }}>
                            <div className="table-hour table-cell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <input type="checkbox" onChange={() => {
                                if (t.dateKey === todayDateKey) {
                                  toggleDailyDone(t.hour)
                                }
                              }} />
                            </div>
                            {isMobile ? (
                              <div className="table-task table-cell" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '12px' }}>
                                  <span>{t.dateKey}</span>
                                  <span>•</span>
                                  <span>{String(t.hour).padStart(2,'0')}:00</span>
                                </div>
                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.text}</div>
                              </div>
                            ) : (
                              <>
                                <div className="table-hour table-cell" style={{ whiteSpace: 'nowrap' }}>{t.dateKey}</div>
                                <div className="table-hour table-cell" style={{ whiteSpace: 'nowrap' }}>{String(t.hour).padStart(2,'0')}:00</div>
                                <div className="table-task table-cell" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.text}</div>
                              </>
                            )}
                          </div>
                        ))}
                        {(pendingDaily.length + allPending.daily.length) === 0 && (
                          <div className="table-empty">No pending daily tasks.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(pendingFilter === 'All' || pendingFilter === 'Weekly') && (
                <div style={{ backgroundColor: '#111116', border: '1px solid #22222a', borderRadius: '14px', padding: isMobile ? '12px' : '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="pill-lg">Weekly</div>
                      <div className="pill">{pendingWeekly.length + allPending.weekly.length} items</div>
                    </div>
                    <button className="btn" onClick={() => setIsWeeklyOpen(!isWeeklyOpen)} style={{ padding: isMobile ? '6px 10px' : '8px 12px', fontSize: isMobile ? '12px' : '13px' }}>{isWeeklyOpen ? 'Hide' : 'Show'}</button>
                  </div>

                  {isWeeklyOpen && (
                    <div className="table">
                      <div className="table-head" style={{ display: isMobile ? 'none' : 'grid', gridTemplateColumns: '70px 200px 1fr', gap: '8px', alignItems: 'center' }}>
                        <div className="table-hour">Done</div>
                        <div className="table-hour">Week</div>
                        <div className="table-task">Goal</div>
                      </div>
                      <div className="table-body">
                        {[...allPending.weekly, ...pendingWeekly.map((g) => ({ weekKey: todayWeekKey, index: g.index, text: g.text }))].map((g, i) => (
                          <div key={`w-${g.weekKey}-${g.index}-${i}`} className="table-row" style={{ 
                            display: 'grid', 
                            gridTemplateColumns: isMobile ? '60px 1fr' : '70px 200px 1fr', 
                            gap: '8px', 
                            alignItems: 'center'
                          }}>
                            <div className="table-hour table-cell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <input type="checkbox" onChange={() => { if (g.weekKey === todayWeekKey) toggleWeeklyDone(g.index) }} />
                            </div>
                            {isMobile ? (
                              <div className="table-task table-cell" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ color: '#9ca3af', fontSize: '12px' }}>{g.weekKey}</div>
                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.text}</div>
                              </div>
                            ) : (
                              <>
                                <div className="table-hour table-cell" style={{ whiteSpace: 'nowrap' }}>{g.weekKey}</div>
                                <div className="table-task table-cell" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.text}</div>
                              </>
                            )}
                          </div>
                        ))}
                        {(pendingWeekly.length + allPending.weekly.length) === 0 && (
                          <div className="table-empty">No pending weekly goals.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(pendingFilter === 'All' || pendingFilter === 'Monthly') && (
                <div style={{ backgroundColor: '#111116', border: '1px solid #22222a', borderRadius: '14px', padding: isMobile ? '12px' : '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="pill-lg">Monthly</div>
                      <div className="pill">{pendingMonthly.length + allPending.monthly.length} items</div>
                    </div>
                    <button className="btn" onClick={() => setIsMonthlyOpen(!isMonthlyOpen)} style={{ padding: isMobile ? '6px 10px' : '8px 12px', fontSize: isMobile ? '12px' : '13px' }}>{isMonthlyOpen ? 'Hide' : 'Show'}</button>
                  </div>

                  {isMonthlyOpen && (
                    <div className="table">
                      <div className="table-head" style={{ display: isMobile ? 'none' : 'grid', gridTemplateColumns: '70px 120px 1fr', gap: '8px', alignItems: 'center' }}>
                        <div className="table-hour">Done</div>
                        <div className="table-hour">Month</div>
                        <div className="table-task">Goal</div>
                      </div>
                      <div className="table-body">
                        {[...allPending.monthly, ...pendingMonthly.map((g) => ({ monthKey: todayMonthKey, index: g.index, text: g.text }))].map((g, i) => (
                          <div key={`m-${g.monthKey}-${g.index}-${i}`} className="table-row" style={{ 
                            display: 'grid', 
                            gridTemplateColumns: isMobile ? '60px 1fr' : '70px 120px 1fr', 
                            gap: '8px', 
                            alignItems: 'center'
                          }}>
                            <div className="table-hour table-cell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <input type="checkbox" onChange={() => { if (g.monthKey === todayMonthKey) toggleMonthlyDone(g.index) }} />
                            </div>
                            {isMobile ? (
                              <div className="table-task table-cell" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ color: '#9ca3af', fontSize: '12px' }}>{g.monthKey}</div>
                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.text}</div>
                              </div>
                            ) : (
                              <>
                                <div className="table-hour table-cell" style={{ whiteSpace: 'nowrap' }}>{g.monthKey}</div>
                                <div className="table-task table-cell" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.text}</div>
                              </>
                            )}
                          </div>
                        ))}
                        {(pendingMonthly.length + allPending.monthly.length) === 0 && (
                          <div className="table-empty">No pending monthly goals.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeTab === 'Notes' ? (
            <NotesTab dailyNotes={dailyNotes} />
          ) : (
            <div style={{
              backgroundColor: '#111116',
              border: '1px solid #22222a',
              borderRadius: '14px',
              padding: '24px',
              textAlign: 'center',
              color: '#c7c7cb'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>{activeTab}</div>
              <div>Coming soon. This section will be available in future updates.</div>
            </div>
          )}
        </div>
      )}
    </div>
  )

}

export default App
