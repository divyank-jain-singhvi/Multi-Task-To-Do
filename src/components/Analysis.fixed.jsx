import { useEffect, useMemo, useState } from 'react'
import { subscribeAllDays, subscribeAllWeeks, subscribeAllMonths } from '../services/realtime'

function Analysis({ user, isMobile = false }) {
  // ... (previous state and subscription code remains the same) ...

  return (
    <div style={{ padding: isMobile ? '12px' : '20px' }}>
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
            position: 'relative',
            paddingBottom: '16px' // Space for horizontal scrollbar
          }}>
            {/* Task grid table */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? `150px repeat(${daysInMonth.length}, 35px)` : `200px repeat(${daysInMonth.length}, 40px)`,
              gap: '2px',
              fontSize: isMobile ? '10px' : '12px',
              minWidth: '100%',
              width: 'max-content',
              marginBottom: '16px'
            }}>
              {/* ... (previous table code remains the same) ... */}
            </div>

            {/* Graph container with proper scroll handling */}
            <div style={{
              backgroundColor: '#18181b',
              border: '1px solid #22222a',
              borderRadius: '10px',
              padding: '16px',
              position: 'relative',
              width: '100%',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'sticky',
                left: 0,
                paddingLeft: '40px',
                paddingBottom: '12px',
                backgroundColor: '#18181b',
                zIndex: 2
              }}>
                <h4 style={{ 
                  margin: 0,
                  fontSize: isMobile ? '13px' : '14px', 
                  color: '#e6e6e9'
                }}>
                  Daily Task Completion Rate
                </h4>
              </div>
              
              <div style={{
                position: 'relative',
                width: '100%',
                overflowX: 'auto',
                overflowY: 'hidden',
                paddingBottom: '16px' // Space for scrollbar
              }}>
                <div style={{ 
                  height: isMobile ? '140px' : '160px',
                  position: 'relative',
                  width: isMobile ? `${150 + (daysInMonth.length * 35)}px` : `${200 + (daysInMonth.length * 40)}px`,
                  minWidth: '100%',
                  paddingLeft: '40px', // Space for Y-axis
                  paddingRight: '20px' // Space for last point
                }}>
                  <svg
                    width="100%"
                    height="100%"
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: '40px' // Align with padding
                    }}
                    preserveAspectRatio="xMinYMin meet"
                  >
                    {/* Y-axis */}
                    <line x1="0" y1="0" x2="0" y2="100%" stroke="#666" strokeWidth="1"/>
                    {[0, 25, 50, 75, 100].map((value) => {
                      const y = (100 - value) * ((isMobile ? 140 : 160) - 40) / 100
                      return (
                        <g key={value}>
                          <line 
                            x1="-4" 
                            y1={y} 
                            x2="4" 
                            y2={y} 
                            stroke="#666" 
                            strokeWidth="1"
                          />
                          <text
                            x="-8"
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

                    {/* Grid background */}
                    <defs>
                      <pattern 
                        id="grid-daily" 
                        width="40" 
                        height="40" 
                        patternUnits="userSpaceOnUse"
                      >
                        <path 
                          d="M 40 0 L 0 0 0 40" 
                          fill="none" 
                          stroke="#333" 
                          strokeWidth="0.5" 
                          opacity="0.3"
                        />
                      </pattern>
                    </defs>
                    <rect 
                      width="100%" 
                      height="100%" 
                      fill="url(#grid-daily)" 
                      opacity="0.5"
                    />

                    {/* Data visualization */}
                    <path
                      d={(() => {
                        if (dailyCompletionData.length === 0) return ''
                        const height = (isMobile ? 140 : 160) - 40
                        const columnWidth = isMobile ? 35 : 40
                        
                        let path = ''
                        dailyCompletionData.forEach((item, index) => {
                          const x = (index * columnWidth) + (columnWidth / 2)
                          const y = height - (item.percentage * height / 100)
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

                    {/* Data points with labels */}
                    {dailyCompletionData.map((item, index) => {
                      const height = (isMobile ? 140 : 160) - 40
                      const columnWidth = isMobile ? 35 : 40
                      const x = (index * columnWidth) + (columnWidth / 2)
                      const y = height - (item.percentage * height / 100)
                      const textY = item.percentage > 90 ? y + 16 : y - 8

                      return (
                        <g key={index}>
                          {/* Point */}
                          <circle
                            cx={x}
                            cy={y}
                            r="4"
                            fill={item.percentage >= 80 ? '#10b981' : item.percentage >= 50 ? '#f59e0b' : '#ef4444'}
                            stroke="#fff"
                            strokeWidth="1"
                          />
                          {/* Task count */}
                          <text
                            x={x}
                            y={y - (item.percentage > 90 ? -24 : 20)}
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
                          >
                            {item.percentage}%
                          </text>
                        </g>
                      )
                    })}
                  </svg>

                  {/* X-axis labels */}
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '40px',
                    right: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: isMobile ? "9px" : "10px",
                    color: '#a1a1aa'
                  }}>
                    {dailyCompletionData.map((item, index) => (
                      <span 
                        key={index}
                        style={{
                          width: isMobile ? '35px' : '40px',
                          textAlign: 'center'
                        }}
                      >
                        {item.day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Weekly and Monthly sections remain the same */}
    </div>
  )
}

export default Analysis