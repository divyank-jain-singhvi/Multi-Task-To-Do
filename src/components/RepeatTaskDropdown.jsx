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
  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd, setRangeEnd] = useState(null)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = initialDate ? new Date(initialDate) : new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })

  // Calendar for picking dates
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
  const monthDates = Array.from({ length: daysInMonth }, (_, i) => new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i + 1))

  function handleDateClick(date) {
    if (mode === 'individual') {
      setIndividualDates((prev) => {
        const exists = prev.some(d => d.getTime() === date.getTime())
        return exists ? prev.filter(d => d.getTime() !== date.getTime()) : [...prev, date]
      })
    } else {
      if (!rangeStart) setRangeStart(date)
      else if (!rangeEnd) setRangeEnd(date)
      else {
        setRangeStart(date)
        setRangeEnd(null)
      }
    }
  }

  function getSelectedDates() {
    let selected = [...individualDates]
    if (rangeStart && rangeEnd) {
      const rangeDates = getDatesInRange(rangeStart, rangeEnd)
      rangeDates.forEach(d => {
        if (!selected.some(dd => dd.getTime() === d.getTime())) selected.push(d)
      })
    }
    return selected
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
        padding: '24px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        minWidth: '340px',
        maxWidth: '95vw'
      }}>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            style={{ 
              background: mode === 'individual' ? '#6366f1' : '#22222a', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              padding: '6px 12px',
              cursor: 'pointer'
            }}
            onClick={() => setMode('individual')}
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
            onClick={() => setMode('range')}
          >Range Selection</button>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {['S','M','T','W','T','F','S'].map((d) => (
              <div key={d} style={{ fontSize: '11px', color: '#a1a1aa', textAlign: 'center' }}>{d}</div>
            ))}
            {monthDates.map(date => {
              const isSelected = getSelectedDates().some(d => d.getTime() === date.getTime())
              const isRangeStart = rangeStart && date.getTime() === rangeStart.getTime()
              const isRangeEnd = rangeEnd && date.getTime() === rangeEnd.getTime()
              return (
                <button
                  key={date.toISOString()}
                  style={{
                    background: isSelected ? '#6366f1' : '#22222a',
                    color: isSelected ? 'white' : '#e6e6e9',
                    border: isRangeStart || isRangeEnd ? '2px solid #22d3ee' : '1px solid #22222a',
                    borderRadius: '6px',
                    padding: '6px 0',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleDateClick(date)}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
        <div style={{ marginBottom: '12px', fontSize: '13px', color: '#a1a1aa', textAlign: 'center' }}>
          Selected Dates: {getSelectedDates().map(d => d.toLocaleDateString()).join(', ') || 'None'}
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button 
            style={{ background: '#374151', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}
            onClick={onClose}
          >Cancel</button>
          <button 
            style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}
            onClick={() => onSave(getSelectedDates())}
          >Save</button>
        </div>
      </div>
    </>
  )
}