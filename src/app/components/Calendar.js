'use client'

import { useState, useMemo, useEffect } from 'react'
import styles from './Calendar.module.css'

const DAYS_PL = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz']
const MONTHS_PL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
]

export default function Calendar({ reservations = [], onDayClick, onDateChange }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Emit initial date on mount
  useEffect(() => {
    if (onDateChange) {
      onDateChange(currentDate.getFullYear(), currentDate.getMonth())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarData = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    // Monday = 0, Sunday = 6
    let startDay = firstDay.getDay() - 1
    if (startDay < 0) startDay = 6

    const days = []

    // Empty cells before first day
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, date: null })
    }

    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const dateStr = date.toISOString().split('T')[0]

      const dayReservations = reservations.filter(r => {
        const start = new Date(r.startDate)
        const end = new Date(r.endDate)
        start.setHours(0, 0, 0, 0)
        end.setHours(0, 0, 0, 0)
        date.setHours(0, 0, 0, 0)
        return date >= start && date <= end
      })

      days.push({
        day: d,
        date: dateStr,
        isReserved: dayReservations.length > 0,
        reservations: dayReservations,
        isToday: dateStr === new Date().toISOString().split('T')[0],
      })
    }

    return days
  }, [year, month, reservations])

  const goToPrevMonth = () => {
    const newDate = new Date(year, month - 1, 1)
    setCurrentDate(newDate)
    if (onDateChange) onDateChange(newDate.getFullYear(), newDate.getMonth())
  }

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1)
    setCurrentDate(newDate)
    if (onDateChange) onDateChange(newDate.getFullYear(), newDate.getMonth())
  }

  const goToToday = () => {
    const newDate = new Date()
    setCurrentDate(newDate)
    if (onDateChange) onDateChange(newDate.getFullYear(), newDate.getMonth())
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={goToPrevMonth} aria-label="Poprzedni miesiąc">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div className={styles.headerCenter}>
          <h2 className={styles.monthYear}>
            {MONTHS_PL[month]} {year}
          </h2>
          <button className={styles.todayBtn} onClick={goToToday}>Dziś</button>
        </div>

        <button className={styles.navBtn} onClick={goToNextMonth} aria-label="Następny miesiąc">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendAvailable}`}></span>
          Wolny
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendDot} ${styles.legendReserved}`}></span>
          Zarezerwowany
        </div>
      </div>

      <div className={styles.grid}>
        {DAYS_PL.map(day => (
          <div key={day} className={styles.dayLabel}>{day}</div>
        ))}

        {calendarData.map((cell, i) => (
          <div
            key={i}
            className={`
              ${styles.cell}
              ${!cell.day ? styles.empty : ''}
              ${cell.isReserved ? styles.reserved : cell.day ? styles.available : ''}
              ${cell.isToday ? styles.today : ''}
            `}
            onClick={() => cell.day && onDayClick && onDayClick(cell)}
            role={cell.day ? 'button' : undefined}
            tabIndex={cell.day ? 0 : undefined}
          >
            {cell.day && (
              <>
                <span className={styles.dayNumber}>{cell.day}</span>
                {cell.isReserved && (
                  <span className={styles.dotIndicator}>
                    {cell.reservations.length > 1 && (
                      <span className={styles.multiDot}>{cell.reservations.length}</span>
                    )}
                  </span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
