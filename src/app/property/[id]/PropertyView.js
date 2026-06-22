'use client'

import { useState, useActionState } from 'react'
import { createReservation, deleteReservation } from '@/app/actions/reservation'
import Calendar from '@/app/components/Calendar'
import Modal from '@/app/components/Modal'
import Link from 'next/link'
import styles from './property.module.css'

export default function PropertyView({ property }) {
  const [showForm, setShowForm] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [visibleMonth, setVisibleMonth] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() })

  const calculateMonthlyIncome = () => {
    let total = 0
    property.reservations.forEach(r => {
      if (!r.pricePerNight) return
      
      const start = new Date(r.startDate)
      const end = new Date(r.endDate)
      start.setHours(0,0,0,0)
      end.setHours(0,0,0,0)
      
      let currentDate = new Date(start)
      while (currentDate < end) {
        if (currentDate.getFullYear() === visibleMonth.year && currentDate.getMonth() === visibleMonth.month) {
          total += r.pricePerNight
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
    })
    return total
  }

  const monthlyIncome = calculateMonthlyIncome()

  const [state, action, pending] = useActionState(async (prevState, formData) => {
    const result = await createReservation(prevState, formData)
    if (result?.success && !result?.warning) {
      setShowForm(false)
    }
    return result
  }, undefined)

  const handleDayClick = (cell) => {
    if (cell.isReserved && cell.reservations.length > 0) {
      setSelectedDay(cell)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Link href="/dashboard" className={styles.backBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </Link>
            <div>
              <h1 className={styles.title}>{property.name}</h1>
              <p className={styles.subtitle}>
                {property.reservations.length} rezerwacji • {property.reservations.filter(r => new Date(r.endDate) >= new Date()).length} nadchodzących
              </p>
            </div>
          </div>
          <div className={styles.headerRight}>
            {property.isOwner && (
              <Link href={`/property/${property.id}/settings`} className="btn btn-outline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
                Ustawienia
              </Link>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className={styles.calendarWrapper}>
          <div className={styles.monthlyIncome}>
            <span>Przewidywany przychód w tym miesiącu: <strong>{monthlyIncome} zł</strong></span>
          </div>
          <Calendar
            reservations={property.reservations}
            onDayClick={handleDayClick}
            onDateChange={(year, month) => setVisibleMonth({ year, month })}
          />
        </div>

        {/* Add Reservation Button */}
        <div className={styles.actions}>
          <button
            className={`btn btn-primary ${styles.addBtn}`}
            onClick={() => setShowForm(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Wpisz rezerwację
          </button>
        </div>

        {/* Upcoming Reservations */}
        {property.reservations.length > 0 && (
          <div className={styles.upcoming}>
            <h2 className={styles.sectionTitle}>Nadchodzące rezerwacje</h2>
            <div className={styles.reservationsList}>
              {property.reservations
                .filter(r => new Date(r.endDate) >= new Date())
                .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                .map(reservation => (
                  <div key={reservation.id} className={styles.reservationCard}>
                    <div className={styles.reservationCardContent}>
                      <div className={styles.reservationDates}>
                        <span className={styles.dateRange}>
                          {formatDate(reservation.startDate)} → {formatDate(reservation.endDate)}
                        </span>
                      </div>
                      <div className={styles.reservationInfo}>
                        <span className={styles.guests}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          {reservation.guestsCount} {reservation.guestsCount === 1 ? 'gość' : reservation.guestsCount < 5 ? 'gości' : 'gości'}
                        </span>
                        {reservation.description && (
                          <span className={styles.description}>{reservation.description}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.reservationActions}>
                      <form action={deleteReservation.bind(null, undefined)}>
                        <input type="hidden" name="reservationId" value={reservation.id} />
                        <input type="hidden" name="propertyId" value={property.id} />
                        <button type="submit" className={styles.deleteBtn} title="Usuń rezerwację" onClick={(e) => {
                          if(!confirm('Czy na pewno chcesz usunąć tę rezerwację?')) e.preventDefault();
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Reservation Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nowa rezerwacja">
        <form action={action} className={styles.form}>
          <input type="hidden" name="propertyId" value={property.id} />

          {state?.error && <div className="error-message">{state.error}</div>}
          {state?.warning && <div className="warning-message">{state.warning}</div>}
          {state?.success && !state?.warning && <div className="success-message">Rezerwacja została dodana!</div>}

          <div className="form-group">
            <label htmlFor="startDate">Data rozpoczęcia</label>
            <input id="startDate" name="startDate" type="date" required />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">Data zakończenia</label>
            <input id="endDate" name="endDate" type="date" required />
          </div>

          <div className="form-group">
            <label htmlFor="guestsCount">Liczba gości</label>
            <input
              id="guestsCount"
              name="guestsCount"
              type="number"
              min="1"
              defaultValue="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Opis (opcjonalny)</label>
            <input
              id="description"
              name="description"
              type="text"
              placeholder="np. Rodzina Kowalskich"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pricePerNight">Koszt za dobę (zł)</label>
            <input
              id="pricePerNight"
              name="pricePerNight"
              type="number"
              min="0"
              step="1"
              defaultValue="0"
            />
          </div>

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={pending}>
            {pending ? 'Dodawanie...' : 'Dodaj rezerwację'}
          </button>
        </form>
      </Modal>

      {/* Day Details Modal */}
      <Modal
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? `Rezerwacje na ${selectedDay.day}.${String(new Date().getMonth() + 1).padStart(2, '0')}` : ''}
      >
        {selectedDay?.reservations?.map(r => (
          <div key={r.id} className={styles.dayDetail}>
            <div className={styles.dayDetailDates}>
              {formatDate(r.startDate)} → {formatDate(r.endDate)}
            </div>
            <div className={styles.dayDetailInfo}>
              <span>{r.guestsCount} {r.guestsCount === 1 ? 'gość' : 'gości'}</span>
              {r.description && <span> • {r.description}</span>}
            </div>
          </div>
        ))}
      </Modal>
    </main>
  )
}
