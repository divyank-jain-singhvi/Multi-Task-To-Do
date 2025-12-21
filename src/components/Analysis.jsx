import { useEffect, useMemo, useState } from 'react'
import { subscribeAllDays, subscribeAllWeeks, subscribeAllMonths } from '../services/realtime'

function Analysis({ user, isMobile = false }) {
  const [allDaysData, setAllDaysData] = useState({})
  const [allWeeksData, setAllWeeksData] = useState({})
  const [allMonthsData, setAllMonthsData] = useState({})
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  // Subscribe to all data for analysis
  useEffect(() => {
    if (!user?.uid) return

    const unsubDays = subscribeAllDays(user.uid, (data) => {
      setAllDaysData(data || {})
    })
    const unsubWeeks = subscribeAllWeeks(user.uid, (data) => {
      setAllWeeksData(data || {})
    })
    const unsubMonths = subscribeAllMonths(user.uid, (data) => {
      setAllMonthsData(data || {})
    })

    return () => {
      unsubDays && unsubDays()
      unsubWeeks && unsubWeeks()
      unsubMonths && unsubMonths()
    }
  }, [user?.uid])

  // Helper functions
  const formatDateKey = (date) => {
    const d = new Date(date)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const formatWeekKey = (date) => {
    const d = new Date(date)
    const jsDay = d.getDay()
    const mondayIndex = (jsDay + 6) % 7
    const start = new Date(d)
    start.setDate(d.getDate() - mondayIndex)
    start.setHours(0, 0, 0, 0)
    const y = start.getFullYear()
    const m = String(start.getMonth() + 1).padStart(2, '0')
    const day = String(start.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const formatMonthKey = (date) => {
    const d = new Date(date)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }

  // Get days in selected month
  const daysInMonth = useMemo(() => {
    const days = []
    const daysCount = new Date(selectedYear, selectedMonth + 1, 0).getDate()
    for (let i = 1; i <= daysCount; i++) {
      const date = new Date(selectedYear, selectedMonth, i)
      days.push({
        date,
        dateKey: formatDateKey(date),
        dayNumber: i
      })
    }
    return days
  }, [selectedYear, selectedMonth])

  // Get all unique hourly tasks for the selected month
  const allHourlyTasks = useMemo(() => {
    const taskMap = new Map()
    
    // First pass: collect all tasks with their hours
    daysInMonth.forEach(({ dateKey }) => {
      const dayData = allDaysData[dateKey]
      if (dayData?.tasks) {
        // Hourly tasks
        Object.entries(dayData.tasks).forEach(([hour, task]) => {
          if (hour === 'extra') return;
          if (task?.text && task.text.trim() !== '') {
            const key = `${hour}:00 - ${task.text}`
            if (!taskMap.has(key)) {
              taskMap.set(key, {
                hour: parseInt(hour),
                text: task.text,
                key,
                originalHour: hour // Keep original hour string
              })
            }
          }
        })
        // Extra tasks: treat as hourly (hour=null)
        if (Array.isArray(dayData.tasks.extra)) {
          dayData.tasks.extra.forEach((task, idx) => {
            if (task?.text && task.text.trim() !== '') {
              const key = `extra${idx}:00 - ${task.text}`
              if (!taskMap.has(key)) {
                taskMap.set(key, {
                  hour: null,
                  text: task.text,
                  key,
                  originalHour: `extra${idx}`
                })
              }
            }
          })
        }
      }
    })
    
    return Array.from(taskMap.values())
      .sort((a, b) => a.hour - b.hour || a.text.localeCompare(b.text))
  }, [allDaysData, daysInMonth])

  // Get weeks in selected year
  const weeksInYear = useMemo(() => {
    const weeks = []
    const startOfYear = new Date(selectedYear, 0, 1)
    const endOfYear = new Date(selectedYear, 11, 31)
    
    let currentWeek = new Date(startOfYear)
    // Find first Monday of the year
    while (currentWeek.getDay() !== 1) {
      currentWeek.setDate(currentWeek.getDate() + 1)
    }
    
    while (currentWeek <= endOfYear) {
      weeks.push({
        weekKey: formatWeekKey(currentWeek),
        startDate: new Date(currentWeek),
        weekNumber: Math.ceil((currentWeek - startOfYear) / (7 * 24 * 60 * 60 * 1000))
      })
      currentWeek.setDate(currentWeek.getDate() + 7)
    }
    
    return weeks
  }, [selectedYear])

  // Get all unique weekly goals for the selected year
  const allWeeklyGoals = useMemo(() => {
    const goalMap = new Map()
    weeksInYear.forEach(({ weekKey }) => {
      const weekData = allWeeksData[weekKey]
      if (weekData?.goals) {
        weekData.goals.forEach((goal) => {
          if (goal?.text && goal.text.trim() !== '') {
            const key = goal.text
            if (!goalMap.has(key)) {
              goalMap.set(key, {
                text: goal.text,
                key
              })
            }
          }
        })
      }
    })
    return Array.from(goalMap.values())
  }, [allWeeksData, weeksInYear])

  // Get months in selected year
  const monthsInYear = useMemo(() => {
    const months = []
    for (let i = 0; i < 12; i++) {
      const date = new Date(selectedYear, i, 1)
      months.push({
        monthKey: formatMonthKey(date),
        monthName: date.toLocaleString('default', { month: 'long' }),
        monthNumber: i + 1
      })
    }
    return months
  }, [selectedYear])

  // Get all unique monthly goals for the selected year
  const allMonthlyGoals = useMemo(() => {
    const goalMap = new Map()
    monthsInYear.forEach(({ monthKey }) => {
      const monthData = allMonthsData[monthKey]
      if (monthData?.goals) {
        monthData.goals.forEach((goal) => {
          if (goal?.text && goal.text.trim() !== '') {
            const key = goal.text
            if (!goalMap.has(key)) {
              goalMap.set(key, {
                text: goal.text,
                key
              })
            }
          }
        })
      }
    })
    return Array.from(goalMap.values())
  }, [allMonthsData, monthsInYear])

  // Calculate daily completion rates for graph
  const dailyCompletionData = useMemo(() => {
    return daysInMonth.map(({ dateKey, dayNumber }) => {
      try {
        const dayData = allDaysData[dateKey]
        if (!dayData?.tasks) return { day: dayNumber, completed: 0, total: 0, percentage: 0 }
        
        // Count all hourly and extra tasks that have text content (including cancelled)
        const allTasks = [
          ...Object.entries(dayData.tasks)
            .filter(([hour, task]) => hour !== 'extra' && task?.text && task.text.trim() !== '')
            .map(([hour, task]) => task),
          ...(Array.isArray(dayData.tasks.extra) ? dayData.tasks.extra.filter(task => task?.text && task.text.trim() !== '') : [])
        ]
        // Count completed tasks (must have text and be marked done, cancelled tasks don't count as completed)
        const completed = allTasks.filter(task => task.done === true && !task.cancelled).length
        const total = allTasks.length
        // Calculate percentage based on tasks actually done vs total tasks
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
        return { day: dayNumber, completed, total, percentage }
      } catch (err) {
        console.warn('Error calculating daily completion:', err)
        return { day: dayNumber, completed: 0, total: 0, percentage: 0 }
      }
    })
  }, [allDaysData, daysInMonth])

  // Calculate weekly completion rates
  const weeklyCompletionData = useMemo(() => {
    return weeksInYear.map(({ weekKey, weekNumber }) => {
      const weekData = allWeeksData[weekKey]
      if (!weekData?.goals) return { week: weekNumber, completed: 0, total: 0, percentage: 0 }
      
      // Count all goals that have text content (including cancelled)
      const allGoals = weekData.goals.filter(goal => goal?.text && goal.text.trim() !== '')
      // Count completed goals (cancelled goals don't count as completed)
      const completed = allGoals.filter(goal => goal.done && !goal.cancelled).length
      const total = allGoals.length
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
      
      return { week: weekNumber, completed, total, percentage }
    })
  }, [allWeeksData, weeksInYear])

  // Calculate monthly completion rates
  const monthlyCompletionData = useMemo(() => {
    return monthsInYear.map(({ monthKey, monthNumber }) => {
      const monthData = allMonthsData[monthKey]
      if (!monthData?.goals) return { month: monthNumber, completed: 0, total: 0, percentage: 0 }
      
      // Count all goals that have text content (including cancelled)
      const allGoals = monthData.goals.filter(goal => goal?.text && goal.text.trim() !== '')
      // Count completed goals (cancelled goals don't count as completed)
      const completed = allGoals.filter(goal => goal.done && !goal.cancelled).length
      const total = allGoals.length
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
      
      return { month: monthNumber, completed, total, percentage }
    })
  }, [allMonthsData, monthsInYear])

  // Check if task exists and is completed for a specific day
  const getTaskStatus = (taskKey, dateKey) => {
    try {
      const dayData = allDaysData[dateKey]
      if (!dayData?.tasks) return 'missing'
      
      // Support both hourly and extra task keys
      const hourlyMatch = taskKey.match(/^([0-9]+):00 - (.+)$/)
      const extraMatch = taskKey.match(/^extra([0-9]+):00 - (.+)$/)
      if (hourlyMatch) {
        const [_, targetHour, targetText] = hourlyMatch
        for (const [hour, task] of Object.entries(dayData.tasks)) {
          if (hour === 'extra') continue;
          if (!task?.text || typeof task.text !== 'string') continue
          if (hour === targetHour && task.text.trim() === targetText.trim()) {
            if (task.cancelled) return 'cancelled'
            return task.done ? 'completed' : 'pending'
          }
        }
      } else if (extraMatch) {
        const [_, extraIdx, targetText] = extraMatch
        const extraArr = Array.isArray(dayData.tasks.extra) ? dayData.tasks.extra : []
        const task = extraArr[parseInt(extraIdx)]
        if (task && task.text.trim() === targetText.trim()) {
          if (task.cancelled) return 'cancelled'
          return task.done ? 'completed' : 'pending'
        }
      }
      return 'missing'
    } catch (err) {
      console.warn('Error checking task status:', err, { taskKey, dateKey })
      return 'missing'
    }
  }

  // Check if weekly goal exists and is completed for a specific week
  const getWeeklyGoalStatus = (goalKey, weekKey) => {
    const weekData = allWeeksData[weekKey]
    if (!weekData?.goals) return 'missing'
    
    const goal = weekData.goals.find(g => g?.text === goalKey)
    if (!goal) return 'missing'
    if (goal.cancelled) return 'cancelled'
    return goal.done ? 'completed' : 'pending'
  }

  // Check if monthly goal exists and is completed for a specific month
  const getMonthlyGoalStatus = (goalKey, monthKey) => {
    const monthData = allMonthsData[monthKey]
    if (!monthData?.goals) return 'missing'
    
    const goal = monthData.goals.find(g => g?.text === goalKey)
    if (!goal) return 'missing'
    if (goal.cancelled) return 'cancelled'
    return goal.done ? 'completed' : 'pending'
  }


  return (
    <div style={{ padding: isMobile ? '12px' : '20px' }}>
      {/* Year/Month Selector */}
      <div style={{
        backgroundColor: '#111116',
        border: '1px solid #22222a',
        borderRadius: '14px',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: '#e6e6e9' }}>Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{
              backgroundColor: '#0b0b0f',
              color: '#e6e6e9',
              border: '1px solid #22222a',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '14px'
            }}
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i
              return <option key={year} value={year}>{year}</option>
            })}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: '#e6e6e9' }}>Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            style={{
              backgroundColor: '#0b0b0f',
              color: '#e6e6e9',
              border: '1px solid #22222a',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '14px'
            }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(selectedYear, i, 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Daily Tasks Analysis */}
      <div style={{
        backgroundColor: '#111116',
        border: '1px solid #22222a',
        borderRadius: '14px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#e6e6e9' }}>
          📊 Daily Tasks Analysis - {new Date(selectedYear, selectedMonth, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        
        {allHourlyTasks.length === 0 ? (
          <div style={{ color: '#a1a1aa', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
            No hourly tasks found for this month
          </div>
        ) : (
          <div style={{ 
            overflowX: 'auto',
            overflowY: 'hidden',
            width: '100%',
            position: 'relative'
          }}>
            {/* Table */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? `150px repeat(${daysInMonth.length}, 35px)` : `200px repeat(${daysInMonth.length}, 40px)`,
              gap: '2px',
              fontSize: isMobile ? '10px' : '12px',
              minWidth: isMobile ? `${150 + (daysInMonth.length * 35)}px` : 'fit-content',
              width: 'max-content'
            }}>
              {/* Header */}
              <div style={{ 
                padding: isMobile ? '6px' : '8px', 
                backgroundColor: '#18181b', 
                borderRadius: '4px', 
                fontWeight: '600',
                fontSize: isMobile ? '10px' : '12px'
              }}>
                Hourly Tasks
              </div>
              {daysInMonth.map(({ dayNumber }) => (
                <div key={dayNumber} style={{
                  padding: isMobile ? '6px 2px' : '8px 4px',
                  backgroundColor: '#18181b',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: isMobile ? '9px' : '12px'
                }}>
                  {dayNumber}
                </div>
              ))}
              
              {/* Task rows */}
              {allHourlyTasks.map((task, index) => (
                <div key={task.key} style={{
                  display: 'contents'
                }}>
                  <div style={{
                    padding: isMobile ? '6px' : '8px',
                    backgroundColor: '#18181b',
                    borderRadius: '4px',
                    fontSize: isMobile ? '9px' : '11px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: isMobile ? '1.2' : '1.4'
                  }}>
                    {task.text}
                  </div>
                  {daysInMonth.map(({ dateKey }) => {
                    const status = getTaskStatus(task.key, dateKey)
                    return (
                      <div key={dateKey} style={{
                        padding: isMobile ? '6px 2px' : '8px 4px',
                        backgroundColor: status === 'completed' ? '#10b981' : 
                                        status === 'pending' ? '#f59e0b' : 
                                        status === 'cancelled' ? '#ef4444' : '#374151',
                        borderRadius: '4px',
                        textAlign: 'center',
                        color: 'white',
                        fontSize: isMobile ? '14px' : '16px'
                      }}>
                        {status === 'completed' ? '✓' : status === 'pending' ? '○' : status === 'cancelled' ? '✕' : '✗'}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Daily completion graph - scrolls with table */}
            <div style={{
              backgroundColor: '#18181b',
              border: '1px solid #22222a',
              borderRadius: '10px',
              padding: isMobile ? '12px' : '16px',
              marginTop: '16px',
              width: 'max-content',
              minWidth: isMobile ? `${150 + (daysInMonth.length * 35) + ((daysInMonth.length - 1) * 2)}px` : `${200 + (daysInMonth.length * 40) + ((daysInMonth.length - 1) * 2)}px`
            }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                fontSize: isMobile ? '13px' : '14px', 
                color: '#e6e6e9' 
              }}>
                Daily Task Completion Rate
              </h4>
              
              <div style={{ 
                height: isMobile ? '140px' : '160px',
                position: 'relative',
                width: '100%',
                marginLeft: '40px' // Space for Y-axis
              }}>
                <svg
                  width="100%"
                  height="100%"
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                >
                  {/* Grid lines and Y-axis */}
                  <defs>
                    <pattern id="grid-daily" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" strokeWidth="0.5" opacity="0.3"/>
                    </pattern>
                  </defs>
                  
                  {/* Background grid */}
                  <rect x="40" width="calc(100% - 40px)" height="100%" fill="url(#grid-daily)" />
                  
                  {/* Y-axis and labels */}
                  <line x1="40" y1="0" x2="40" y2="100%" stroke="#666" strokeWidth="1"/>
                  {[0, 25, 50, 75, 100, 125,150].map((value) => {
                    const y = (150 - value) * ((isMobile ? 140 : 160) - 40) / 150
                    return (
                      <g key={value}>
                        <line 
                          x1="36" 
                          y1={y} 
                          x2="44" 
                          y2={y} 
                          stroke="#666" 
                          strokeWidth="1"
                        />
                        <text
                          x="32"
                          y={y + 4}
                          textAnchor="end"
                          fontSize={isMobile ? "9px" : "10px"}
                          fill="#a1a1aa"
                        >
                          {value}%
                        </text>
                      </g>
                    )
                  })}
                  
                  {/* Line chart */}
                  <path
                    d={(() => {
                      if (dailyCompletionData.length === 0) return ''
                      const height = (isMobile ? 140 : 160) - 40 // Total height minus bottom margin
                      const columnWidth = isMobile ? 35 : 40
                      const taskColumnWidth = isMobile ? 150 : 200
                      const yAxisOffset = 0 // X offset for y-axis
                      
                      let path = ''
                      dailyCompletionData.forEach((item, index) => {
                        const x = yAxisOffset + taskColumnWidth + (index * columnWidth) + (columnWidth / 2)
                        const y = height - (item.percentage * height / 150) // Use percentage directly
                        if (index === 0) {
                          path += `M ${x} ${y}`
                        } else {
                          path += ` L ${x} ${y}`
                        }
                      })
                      return path
                    })()}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points aligned with table columns */}
                  {dailyCompletionData.map((item, index) => {
                    const height = (isMobile ? 140 : 160) - 40
                    const columnWidth = isMobile ? 35 : 40
                    const taskColumnWidth = isMobile ? 150 : 200
                    const yAxisOffset = 0
                    
                    const x = yAxisOffset + taskColumnWidth + (index * columnWidth) + (columnWidth / 2)
                    const y = height - (item.percentage * height / 150) // Use percentage directly
                    
                    const textY = y - 8 // Flip label position if near top
                    
                    return (
                      <g key={index}>
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill={item.percentage >= 80 ? '#10b981' : item.percentage >= 50 ? '#f59e0b' : '#ef4444'}
                          stroke="#fff"
                          strokeWidth="1"
                        />
                        {/* Task count badge */}
                        <text
                          x={x}
                          y={y - 20}
                          textAnchor="middle"
                          fontSize={isMobile ? "8px" : "9px"}
                          fill="#666"
                        >
                          {item.completed}/{item.total}
                        </text>
                        {/* Percentage */}
                        <text
                          x={x}
                          y={textY}
                          textAnchor="middle"
                          fontSize={isMobile ? "9px" : "10px"}
                          fill="#a1a1aa"
                          style={{ pointerEvents: 'none' }}
                        >
                          {item.percentage}%
                        </text>
                      </g>
                    )
                  })}
                </svg>
                
                {/* X-axis labels aligned with table columns */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  fontSize: '10px',
                  color: '#a1a1aa'
                }}>
                  {dailyCompletionData.map((item, index) => {
                    const columnWidth = isMobile ? 35 : 40
                    const taskColumnWidth = isMobile ? 150 : 200
                    
                    return (
                      <span 
                        key={index} 
                        style={{ 
                          fontSize: '9px',
                          position: 'absolute',
                          left: `${taskColumnWidth + (index * columnWidth) + (columnWidth / 2)}px`,
                          transform: 'translateX(-50%)', // Center the label
                          width: `${columnWidth}px`,
                          textAlign: 'center'
                        }}
                      >
                        {item.day}
                      </span>
                    )
                  })}
                </div>
              </div>
              
              <div style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                color: '#a1a1aa', 
                marginTop: '8px', 
                textAlign: 'center' 
              }}>
                Tasks Completed
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Tasks Analysis */}
      <div style={{
        backgroundColor: '#111116',
        border: '1px solid #22222a',
        borderRadius: '14px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#e6e6e9' }}>
          📅 Weekly Goals Analysis - {selectedYear}
        </h3>
        
        {allWeeklyGoals.length === 0 ? (
          <div style={{ color: '#a1a1aa', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
            No weekly goals found for this year
          </div>
        ) : (
          <div style={{ 
            overflowX: 'auto',
            overflowY: 'hidden',
            width: '100%',
            position: 'relative'
          }}>
            {/* Table */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? `120px repeat(${weeksInYear.length}, 30px)` : `200px repeat(${weeksInYear.length}, 60px)`,
              gap: '2px',
              fontSize: isMobile ? '10px' : '12px',
              minWidth: isMobile ? `${120 + (weeksInYear.length * 30)}px` : 'fit-content',
              width: 'max-content'
            }}>
              {/* Header */}
              <div style={{ 
                padding: isMobile ? '6px' : '8px', 
                backgroundColor: '#18181b', 
                borderRadius: '4px', 
                fontWeight: '600',
                fontSize: isMobile ? '10px' : '12px'
              }}>
                Weekly Goals
              </div>
              {weeksInYear.map(({ weekNumber }) => (
                <div key={weekNumber} style={{
                  padding: isMobile ? '6px 2px' : '8px 4px',
                  backgroundColor: '#18181b',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: isMobile ? '8px' : '12px'
                }}>
                  W{weekNumber}
                </div>
              ))}
              
              {/* Goal rows */}
              {allWeeklyGoals.map((goal, index) => (
                <div key={goal.key} style={{
                  display: 'contents'
                }}>
                  <div style={{
                    padding: isMobile ? '6px' : '8px',
                    backgroundColor: '#18181b',
                    borderRadius: '4px',
                    fontSize: isMobile ? '9px' : '11px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: isMobile ? '1.2' : '1.4'
                  }}>
                    {goal.text}
                  </div>
                  {weeksInYear.map(({ weekKey }) => {
                    const status = getWeeklyGoalStatus(goal.key, weekKey)
                    return (
                      <div key={weekKey} style={{
                        padding: isMobile ? '6px 2px' : '8px 4px',
                        backgroundColor: status === 'completed' ? '#10b981' : 
                                        status === 'pending' ? '#f59e0b' : '#374151',
                        borderRadius: '4px',
                        textAlign: 'center',
                        color: 'white',
                        fontSize: isMobile ? '12px' : '16px'
                      }}>
                        {status === 'completed' ? '✓' : status === 'pending' ? '○' : '✗'}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Weekly completion graph - scrolls with table */}
            <div style={{
              backgroundColor: '#18181b',
              border: '1px solid #22222a',
              borderRadius: '10px',
              padding: isMobile ? '12px' : '16px',
              marginTop: '16px',
              width: 'max-content',
              minWidth: isMobile ? `${120 + (weeksInYear.length * 30) + ((weeksInYear.length - 1) * 2)}px` : `${200 + (weeksInYear.length * 60) + ((weeksInYear.length - 1) * 2)}px`
            }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                fontSize: isMobile ? '13px' : '14px', 
                color: '#e6e6e9' 
              }}>
                Weekly Goal Completion Rate
              </h4>
              
              <div style={{ 
                height: isMobile ? '140px' : '160px',
                position: 'relative',
                width: '100%',
                marginLeft: '40px' // Space for Y-axis
              }}>
                <svg
                  width="100%"
                  height="100%"
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                >
                  {/* Grid lines and Y-axis */}
                  <defs>
                    <pattern id="grid-weekly" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" strokeWidth="0.5" opacity="0.3"/>
                    </pattern>
                  </defs>
                  
                  {/* Background grid */}
                  <rect x="40" width="calc(100% - 40px)" height="100%" fill="url(#grid-weekly)" />
                  
                  {/* Y-axis and labels */}
                  <line x1="40" y1="0" x2="40" y2="100%" stroke="#666" strokeWidth="1"/>
                  {[0, 25, 50, 75, 100, 125, 150].map((value) => {
                    const y = (150 - value) * ((isMobile ? 140 : 160) - 40) / 150
                    return (
                      <g key={value}>
                        <line 
                          x1="36" 
                          y1={y} 
                          x2="44" 
                          y2={y} 
                          stroke="#666" 
                          strokeWidth="1"
                        />
                        <text
                          x="32"
                          y={y + 4}
                          textAnchor="end"
                          fontSize={isMobile ? "9px" : "10px"}
                          fill="#a1a1aa"
                        >
                          {value}%
                        </text>
                      </g>
                    )
                  })}
                  
                  {/* Line chart */}
                  <path
                    d={(() => {
                      if (weeklyCompletionData.length === 0) return ''
                      const height = (isMobile ? 140 : 160) - 40
                      const columnWidth = isMobile ? 30 : 60
                      const taskColumnWidth = isMobile ? 120 : 200
                      const yAxisOffset = 0
                      
                      let path = ''
                      weeklyCompletionData.forEach((item, index) => {
                        const x = yAxisOffset + taskColumnWidth + (index * columnWidth) + (columnWidth / 2)
                        const y = height - (item.percentage * height / 150) // Use percentage directly
                        if (index === 0) {
                          path += `M ${x} ${y}`
                        } else {
                          path += ` L ${x} ${y}`
                        }
                      })
                      return path
                    })()}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points aligned with table columns */}
                  {weeklyCompletionData.map((item, index) => {
                    const height = (isMobile ? 140 : 160) - 40
                    const columnWidth = isMobile ? 30 : 60
                    const taskColumnWidth = isMobile ? 120 : 200
                    const yAxisOffset = 0
                    
                    const x = yAxisOffset + taskColumnWidth + (index * columnWidth) + (columnWidth / 2)
                    const y = height - (item.percentage * height / 150)
                    
                    const textY = y - 8 // Flip label position if near top
                    
                    return (
                      <g key={index}>
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill={item.percentage >= 80 ? '#10b981' : item.percentage >= 50 ? '#f59e0b' : '#ef4444'}
                          stroke="#fff"
                          strokeWidth="1"
                        />
                        {/* Goal count badge */}
                        <text
                          x={x}
                          y={y -  20}
                          textAnchor="middle"
                          fontSize={isMobile ? "8px" : "9px"}
                          fill="#666"
                        >
                          {item.completed}/{item.total}
                        </text>
                        {/* Percentage */}
                        <text
                          x={x}
                          y={textY}
                          textAnchor="middle"
                          fontSize={isMobile ? "9px" : "10px"}
                          fill="#a1a1aa"
                          style={{ pointerEvents: 'none' }}
                        >
                          {item.percentage}%
                        </text>
                      </g>
                    )
                  })}
                </svg>
                
                {/* X-axis labels aligned with table columns */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  fontSize: '10px',
                  color: '#a1a1aa'
                }}>
                  {weeklyCompletionData.map((item, index) => {
                    const columnWidth = isMobile ? 30 : 60
                    const taskColumnWidth = isMobile ? 120 : 200
                    
                    return (
                      <span 
                        key={index} 
                        style={{ 
                          fontSize: '9px',
                          position: 'absolute',
                          left: `${taskColumnWidth + (index * columnWidth) + (columnWidth / 2)}px`,
                          transform: 'translateX(-50%)', // Center the label
                          width: `${columnWidth}px`,
                          textAlign: 'center'
                        }}
                      >
                        W{item.week}
                      </span>
                    )
                  })}
                </div>
              </div>
              
              <div style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                color: '#a1a1aa', 
                marginTop: '8px', 
                textAlign: 'center' 
              }}>
                Goals Completed
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Tasks Analysis */}
      <div style={{
        backgroundColor: '#111116',
        border: '1px solid #22222a',
        borderRadius: '14px',
        padding: '16px'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#e6e6e9' }}>
          🎯 Monthly Goals Analysis - {selectedYear}
        </h3>
        
        {allMonthlyGoals.length === 0 ? (
          <div style={{ color: '#a1a1aa', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
            No monthly goals found for this year
          </div>
        ) : (
          <div style={{ 
            overflowX: 'auto',
            overflowY: 'hidden',
            width: '100%',
            position: 'relative'
          }}>
            {/* Table */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? `120px repeat(12, 25px)` : `200px repeat(12, 60px)`,
              gap: '2px',
              fontSize: isMobile ? '10px' : '12px',
              minWidth: isMobile ? `${120 + (12 * 25)}px` : 'fit-content',
              width: 'max-content'
            }}>
              {/* Header */}
              <div style={{ 
                padding: isMobile ? '6px' : '8px', 
                backgroundColor: '#18181b', 
                borderRadius: '4px', 
                fontWeight: '600',
                fontSize: isMobile ? '10px' : '12px'
              }}>
                Monthly Goals
              </div>
              {monthsInYear.map(({ monthNumber, monthName }) => (
                <div key={monthNumber} style={{
                  padding: isMobile ? '6px 1px' : '8px 4px',
                  backgroundColor: '#18181b',
                  borderRadius: '4px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: isMobile ? '7px' : '10px'
                }}>
                  {monthName.substring(0, 3)}
                </div>
              ))}
              
              {/* Goal rows */}
              {allMonthlyGoals.map((goal, index) => (
                <div key={goal.key} style={{
                  display: 'contents'
                }}>
                  <div style={{
                    padding: isMobile ? '6px' : '8px',
                    backgroundColor: '#18181b',
                    borderRadius: '4px',
                    fontSize: isMobile ? '9px' : '11px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: isMobile ? '1.2' : '1.4'
                  }}>
                    {goal.text}
                  </div>
                  {monthsInYear.map(({ monthKey }) => {
                    const status = getMonthlyGoalStatus(goal.key, monthKey)
                    return (
                      <div key={monthKey} style={{
                        padding: isMobile ? '6px 1px' : '8px 4px',
                        backgroundColor: status === 'completed' ? '#10b981' : 
                                        status === 'pending' ? '#f59e0b' : '#374151',
                        borderRadius: '4px',
                        textAlign: 'center',
                        color: 'white',
                        fontSize: isMobile ? '10px' : '16px'
                      }}>
                        {status === 'completed' ? '✓' : status === 'pending' ? '○' : '✗'}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            {/* Monthly completion graph - scrolls with table */}
            <div style={{
              backgroundColor: '#18181b',
              border: '1px solid #22222a',
              borderRadius: '10px',
              padding: isMobile ? '12px' : '16px',
              marginTop: '16px',
              width: 'max-content',
              minWidth: isMobile ? `${178 + (12 * 25) + (11 * 2)}px` : `${258 + (12 * 60) + (11 * 2)}px`
            }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                fontSize: isMobile ? '13px' : '14px', 
                color: '#e6e6e9' 
              }}>
                Monthly Goal Completion Rate
              </h4>
              
              <div style={{ 
                height: isMobile ? '140px' : '160px',
                position: 'relative',
                width: '100%',
                marginLeft: '40px' // Space for Y-axis
              }}>
                <svg
                  width="100%"
                  height="100%"
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                >
                  {/* Grid lines and Y-axis */}
                  <defs>
                    <pattern id="grid-monthly" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#333" strokeWidth="0.5" opacity="0.3"/>
                    </pattern>
                  </defs>
                  
                  {/* Background grid */}
                  <rect x="40" width="calc(100% - 40px)" height="100%" fill="url(#grid-monthly)" />
                  
                  {/* Y-axis and labels */}
                  <line x1="40" y1="0" x2="40" y2="100%" stroke="#666" strokeWidth="1"/>
                  {[0, 25, 50, 75, 100, 125, 150].map((value) => {
                    const y = (150 - value) * ((isMobile ? 140 : 160) - 40) / 150
                    return (
                      <g key={value}>
                        <line 
                          x1="36" 
                          y1={y} 
                          x2="44" 
                          y2={y} 
                          stroke="#666" 
                          strokeWidth="1"
                        />
                        <text
                          x="32"
                          y={y + 4}
                          textAnchor="end"
                          fontSize={isMobile ? "9px" : "10px"}
                          fill="#a1a1aa"
                        >
                          {value}%
                        </text>
                      </g>
                    )
                  })}
                  
                  {/* Line chart */}
                  <path
                    d={(() => {
                      if (monthlyCompletionData.length === 0) return ''
                      const height = (isMobile ? 140 : 160) - 40
                      const columnWidth = isMobile ? 25 : 60
                      const taskColumnWidth = isMobile ? 120 : 200
                      const yAxisOffset = 0
                      
                      let path = ''
                      monthlyCompletionData.forEach((item, index) => {
                        const x = yAxisOffset + taskColumnWidth + (index * columnWidth) + (columnWidth / 2)
                        const y = height - (item.percentage * height / 150) // Use percentage directly
                        if (index === 0) {
                          path += `M ${x} ${y}`
                        } else {
                          path += ` L ${x} ${y}`
                        }
                      })
                      return path
                    })()}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points aligned with table columns */}
                  {monthlyCompletionData.map((item, index) => {
                    const height = (isMobile ? 140 : 160) - 40
                    const columnWidth = isMobile ? 25 : 60
                    const taskColumnWidth = isMobile ? 120 : 200
                    const yAxisOffset = 0
                    
                    const x = yAxisOffset + taskColumnWidth + (index * columnWidth) + (columnWidth / 2)
                    const y = height - (item.percentage * height / 150)
                    
                    const textY = y - 8 // Flip label position if near top
                    
                    return (
                      <g key={index}>
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill={item.percentage >= 80 ? '#10b981' : item.percentage >= 50 ? '#f59e0b' : '#ef4444'}
                          stroke="#fff"
                          strokeWidth="1"
                        />
                        {/* Goal count badge */}
                        <text
                          x={x}
                          y={y - 20}
                          textAnchor="middle"
                          fontSize={isMobile ? "8px" : "9px"}
                          fill="#666"
                        >
                          {item.completed}/{item.total}
                        </text>
                        {/* Percentage */}
                        <text
                          x={x}
                          y={textY}
                          textAnchor="middle"
                          fontSize={isMobile ? "9px" : "10px"}
                          fill="#a1a1aa"
                          style={{ pointerEvents: 'none' }}
                        >
                          {item.percentage}%
                        </text>
                      </g>
                    )
                  })}
                </svg>
                
                {/* X-axis labels aligned with table columns */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  fontSize: '10px',
                  color: '#a1a1aa'
                }}>
                  {monthlyCompletionData.map((item, index) => {
                    const columnWidth = isMobile ? 25 : 60
                    const taskColumnWidth = isMobile ? 120 : 200
                    
                    return (
                      <span 
                        key={index} 
                        style={{ 
                          fontSize: '9px',
                          position: 'absolute',
                          left: `${taskColumnWidth + (index * columnWidth) + (columnWidth / 2)}px`,
                          transform: 'translateX(-50%)', // Center the label
                          width: `${columnWidth}px`,
                          textAlign: 'center'
                        }}
                      >
                        {item.month}
                      </span>
                    )
                  })}
                </div>
              </div>
              
              <div style={{ 
                fontSize: isMobile ? '11px' : '12px', 
                color: '#a1a1aa', 
                marginTop: '8px', 
                textAlign: 'center' 
              }}>
                Goals Completed
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analysis
