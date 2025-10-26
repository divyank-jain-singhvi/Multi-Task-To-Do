import { useState } from 'react'

function getDatesInRange(start, end) {
  const dates = []
  let current = new Date(start)
  current.setHours(0,0,0,0)
  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

export default function RepeatTaskDropdown({ 
  open, 
  onClose, 
  onSave, 
  initialDate, 
  hourTaskText 
}) {
  const [mode, setMode] = useState('individual')
  const [individualDates, setIndividualDates] = useState([])
  const [ranges, setRanges] = useState([]) // Array of {start: Date, end: Date}
  const [currentRange, setCurrentRange] = useState({ start: null, end: null })
  const baseDate = initialDate ? new Date(initialDate) : new Date()
  const [weeklyWeekday, setWeeklyWeekday] = useState(baseDate.getDay()) // 0..6
  const [weeklyCount, setWeeklyCount] = useState(4)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = initialDate ? new Date(initialDate) : new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  // Calendar for picking dates
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
  const startDay = monthStart.getDay() // 0 = Sunday, 1 = Monday, ...
  const monthDates = Array.from({ length: daysInMonth }, (_, i) => new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i + 1))

  // Build grid slots: leading blanks so the 1st of month aligns to its weekday, and trailing blanks to complete the last week
  const gridDates = []
  for (let i = 0; i < startDay; i++) gridDates.push(null)
  monthDates.forEach(d => gridDates.push(d))
  while (gridDates.length % 7 !== 0) gridDates.push(null)

  // Localized weekday labels (short form) starting from Sunday..Saturday
  const weekdayLabels = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(new Date(2021, 7, 1 + i)))

  function handleDateClick(date) {
    if (mode === 'individual') {
      setIndividualDates((prev) => {
        const exists = prev.some(d => d.getTime() === date.getTime())
        return exists ? prev.filter(d => d.getTime() !== date.getTime()) : [...prev, date]
      })
    } else {
      // Range selection mode
      setCurrentRange(prev => {
        if (!prev.start) {
          // Starting a new range
          return { start: date, end: null }
        } else if (!prev.end) {
          // Completing the current range
          const start = new Date(Math.min(prev.start.getTime(), date.getTime()))
          const end = new Date(Math.max(prev.start.getTime(), date.getTime()))
          // Add the completed range to ranges array
          setRanges(prevRanges => [...prevRanges, { start, end }])
          return { start: null, end: null } // Reset current range
        }
        return prev
      })
    }
  }

  function getSelectedDates() {
    let selected = [...individualDates]
    if (mode === 'range') {
      // Add dates from all completed ranges
      ranges.forEach(range => {
        const rangeDates = getDatesInRange(range.start, range.end)
        rangeDates.forEach(d => {
          if (!selected.some(dd => dd.getTime() === d.getTime())) {
            selected.push(d)
          }
        })
      })
      // Add dates from current in-progress range if any
      if (currentRange.start && currentRange.end) {
        const rangeDates = getDatesInRange(currentRange.start, currentRange.end)
        rangeDates.forEach(d => {
          if (!selected.some(dd => dd.getTime() === d.getTime())) {
            selected.push(d)
          }
        })
      }
    }
    return selected
  }

  function getWeeklyDates() {
    const start = new Date(baseDate)
    start.setHours(0,0,0,0)
    const results = []
    // find first occurrence (may be same day)
    const delta = (weeklyWeekday - start.getDay() + 7) % 7
    const first = new Date(start)
    first.setDate(start.getDate() + delta)
    for (let i = 0; i < Number(weeklyCount || 0); i++) {
      const d = new Date(first)
      d.setDate(first.getDate() + i * 7)
      results.push(d)
    }
    return results
  }

  if (!open) return null

  return (
    <>
      {/* Blurred background overlay */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(20,20,30,0.4)',
        backdropFilter: 'blur(6px)',
        zIndex: 999
      }} onClick={onClose} />

      {/* Centered dropdown */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        background: '#18181b',
        border: '1px solid #22222a',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        width: '360px',
        maxWidth: '95vw',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            style={{ 
              background: mode === 'individual' ? '#6366f1' : '#22222a', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              padding: '6px 12px',
              cursor: 'pointer'
            }}
            onClick={() => {
              setMode('individual')
              setRanges([])
              setCurrentRange({ start: null, end: null })
            }}
          >Individual Dates</button>
          <button 
            style={{ 
              background: mode === 'range' ? '#6366f1' : '#22222a', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              padding: '6px 12px',
              cursor: 'pointer'
            }}
            onClick={() => {
              setMode('range')
              setIndividualDates([])
              setCurrentRange({ start: null, end: null })
            }}
          >Range Selection</button>
          <button 
            style={{ 
              background: mode === 'weekly' ? '#6366f1' : '#22222a', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              padding: '6px 12px',
              cursor: 'pointer'
            }}
            onClick={() => setMode('weekly')}
          >Weekly Repeat</button>
        </div>
        <div style={{ marginBottom: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#e6e6e9', marginBottom: '6px' }}>Select Dates:</div>
          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <button
              style={{
                background: '#22222a',
                color: '#e6e6e9',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer'
              }}
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
            >◀</button>
            <span style={{ color: '#e6e6e9', fontWeight: 600 }}>
              {calendarMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </span>
            <button
              style={{
                background: '#22222a',
                color: '#e6e6e9',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer'
              }}
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
            >▶</button>
          </div>
          <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: '4px', 
              alignItems: 'center', 
              height: mode === 'weekly' ? '220px' : '280px',
              gridAutoRows: mode === 'weekly' ? '28px' : '36px',
              marginBottom: '12px'
            }}>
            {weekdayLabels.map((d, idx) => (
              <div key={d + idx} style={{ fontSize: '11px', color: '#a1a1aa', textAlign: 'center', height: '20px' }}>{d}</div>
            ))}

            {gridDates.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} style={{ height: '36px' }} />
              }
              const isSelected = getSelectedDates().some(d => d.getTime() === date.getTime())
              const isRangeStart = mode === 'range' && (
                currentRange.start?.getTime() === date.getTime() ||
                ranges.some(r => r.start.getTime() === date.getTime())
              )
              const isRangeEnd = mode === 'range' && (
                currentRange.end?.getTime() === date.getTime() ||
                ranges.some(r => r.end.getTime() === date.getTime())
              )
              return (
                <button
                  key={date.toISOString()}
                  style={{
                    background: isSelected ? '#6366f1' : '#22222a',
                    color: isSelected ? 'white' : '#e6e6e9',
                    border: isRangeStart || isRangeEnd ? '2px solid #22d3ee' : '1px solid #22222a',
                    borderRadius: '6px',
                    height: '36px',
                    padding: '0',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => handleDateClick(date)}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
          {/* Weekly repeat controls */}
          {mode === 'weekly' && (
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '12px',
              background: '#0b0b0f',
              borderRadius: '8px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ color: '#a1a1aa', fontSize: 13, minWidth: '70px' }}>Repeat on:</div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(7, 1fr)', 
                  gap: 4, 
                  flex: 1 
                }}>
                  {weekdayLabels.map((label, i) => (
                    <button
                      key={`wd-${i}`}
                      onClick={() => setWeeklyWeekday(i)}
                      style={{
                        padding: '4px 2px',
                        borderRadius: 6,
                        border: weeklyWeekday === i ? '2px solid #22d3ee' : '1px solid #22222a',
                        background: weeklyWeekday === i ? '#6366f1' : '#22222a',
                        color: weeklyWeekday === i ? 'white' : '#e6e6e9',
                        cursor: 'pointer',
                        fontSize: 11,
                        minWidth: 0
                      }}
                    >{label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ color: '#a1a1aa', fontSize: 13, minWidth: '70px' }}>Duration:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={weeklyCount}
                    onChange={(e) => setWeeklyCount(Math.max(1, Math.min(52, Number(e.target.value || 0))))}
                    style={{ 
                      width: 50, 
                      padding: '4px 6px', 
                      borderRadius: 6, 
                      background: '#18181b', 
                      border: '1px solid #22222a', 
                      color: '#e6e6e9',
                      fontSize: 12
                    }}
                  />
                  <div style={{ color: '#a1a1aa', fontSize: 13 }}>weeks</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{ 
            marginBottom: '12px', 
            fontSize: '13px', 
            color: '#a1a1aa',
            padding: '8px',
            background: '#0b0b0f',
            borderRadius: '8px',
            minHeight: '36px',
            maxHeight: '80px',
            overflowY: 'auto'
          }}>
          {mode === 'weekly' ? (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '12px' }}>
                Every {weekdayLabels[weeklyWeekday]} for {weeklyCount} weeks
              </span>
            </div>
          ) : mode === 'range' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {ranges.length === 0 && !currentRange.start ? (
                <div style={{ textAlign: 'center', fontSize: '12px' }}>No ranges selected</div>
              ) : (
                <>
                  {ranges.map((range, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      padding: '2px 4px'
                    }}>
                      <span>
                        {range.start.toLocaleDateString()} - {range.end.toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => setRanges(prev => prev.filter((_, i) => i !== index))}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '2px 6px',
                          fontSize: '12px'
                        }}
                      >×</button>
                    </div>
                  ))}
                  {currentRange.start && (
                    <div style={{ fontSize: '12px', color: '#22d3ee' }}>
                      Selecting range: {currentRange.start.toLocaleDateString()}...
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '12px' }}>
                Selected Dates: {getSelectedDates().map(d => d.toLocaleDateString()).join(', ') || 'None'}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: 'auto' }}>
          <button 
            style={{ background: '#374151', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}
            onClick={onClose}
          >Cancel</button>
          <button 
            style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}
            onClick={() => {
              if (mode === 'weekly') {
                onSave(getWeeklyDates())
              } else {
                onSave(getSelectedDates())
              }
            }}
          >Save</button>
        </div>
      </div>
    </>
  )
}