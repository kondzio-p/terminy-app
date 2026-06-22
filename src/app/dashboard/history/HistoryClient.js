'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import styles from './history.module.css'

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getMonthYear = (dateStr) => {
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${date.getFullYear()}-${month}`
}

const MONTHS = [
  { value: 'all', label: 'Wszystkie miesiące' },
  { value: '01', label: 'Styczeń' },
  { value: '02', label: 'Luty' },
  { value: '03', label: 'Marzec' },
  { value: '04', label: 'Kwiecień' },
  { value: '05', label: 'Maj' },
  { value: '06', label: 'Czerwiec' },
  { value: '07', label: 'Lipiec' },
  { value: '08', label: 'Sierpień' },
  { value: '09', label: 'Wrzesień' },
  { value: '10', label: 'Październik' },
  { value: '11', label: 'Listopad' },
  { value: '12', label: 'Grudzień' },
]

export default function HistoryClient({ allReservations }) {
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [filterYear, setFilterYear] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')

  // Generate unique properties for filter
  const properties = useMemo(() => {
    const map = new Map()
    allReservations.forEach(r => {
      if (!map.has(r.propertyId)) {
        map.set(r.propertyId, r.propertyName)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [allReservations])

  // Generate unique years for filter
  const availableYears = useMemo(() => {
    const set = new Set()
    allReservations.forEach(r => {
      set.add(new Date(r.startDate).getFullYear().toString())
    })
    return Array.from(set).sort((a, b) => b.localeCompare(a)) // sort descending
  }, [allReservations])

  // Apply filters
  const filteredReservations = useMemo(() => {
    return allReservations.filter(r => {
      const matchProperty = propertyFilter === 'all' || r.propertyId === propertyFilter

      const date = new Date(r.startDate)
      const year = date.getFullYear().toString()
      const month = String(date.getMonth() + 1).padStart(2, '0')

      const matchYear = filterYear === 'all' || year === filterYear
      const matchMonth = filterMonth === 'all' || month === filterMonth

      return matchProperty && matchYear && matchMonth
    })
  }, [allReservations, propertyFilter, filterYear, filterMonth])

  const totalFilteredIncome = filteredReservations.reduce((sum, r) => sum + r.totalIncome, 0)

  return (
    <>
      <div className={styles.header}>
        <Link href="/dashboard" className={styles.backBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div>
          <h1 className={styles.title}>Historia finansowa</h1>
          <p className={styles.subtitle}>
            Przychód z wybranych kryteriów: <strong>{totalFilteredIncome} zł</strong>
          </p>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="propertyFilter">Posiadłość:</label>
          <select
            id="propertyFilter"
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Wszystkie</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filterYear">Rok:</label>
          <select
            id="filterYear"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Zawsze</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {filterYear !== 'all' && (
          <div className={styles.filterGroup}>
            <label htmlFor="filterMonth">Miesiąc:</label>
            <select
              id="filterMonth"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className={styles.filterSelect}
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={styles.list}>
        {filteredReservations.length === 0 ? (
          <div className={styles.empty}>
            <p>Brak rezerwacji dla wybranych filtrów.</p>
          </div>
        ) : (
          filteredReservations.map(res => (
            <div key={res.id} className={styles.card}>
              <div className={styles.infoLeft}>
                <div className={styles.propertyName}>{res.propertyName}</div>
                <div className={styles.reservationDates}>
                  {formatDate(res.startDate)} → {formatDate(res.endDate)}
                </div>
                {res.description && (
                  <div className={styles.description}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {res.description}
                  </div>
                )}
                {res.phoneNumber && (
                  <div className={styles.description}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    {res.phoneNumber}
                  </div>
                )}
              </div>
              <div className={styles.infoRight}>
                <div className={styles.income}>+{res.totalIncome} zł</div>
                <div className={styles.calcDetails}>
                  {res.nights} {res.nights === 1 ? 'noc' : 'nocy'} x {res.pricePerNight || 0} zł
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
