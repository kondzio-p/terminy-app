'use client'

import { useState, useActionState } from 'react'
import { createProperty } from '@/app/actions/property'
import Link from 'next/link'
import Modal from '@/app/components/Modal'
import styles from './dashboard.module.css'

export default function DashboardContent({ ownedProperties, collaboratedProperties }) {
  const [showModal, setShowModal] = useState(false)
  const [state, action, pending] = useActionState(async (prevState, formData) => {
    const result = await createProperty(prevState, formData)
    if (result?.success) {
      setShowModal(false)
    }
    return result
  }, undefined)

  const allProperties = [
    ...ownedProperties.map(p => ({ ...p, role: 'owner' })),
    ...collaboratedProperties.map(p => ({ ...p, role: 'collaborator' })),
  ]

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Twoje nieruchomości</h1>
          <p className={styles.pageSubtitle}>
            Zarządzaj terminami rezerwacji swoich posiadłości
          </p>
        </div>

        <div className={styles.grid}>
          {/* Add property card */}
          <button className={styles.addCard} onClick={() => setShowModal(true)}>
            <div className={styles.addIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <span className={styles.addText}>Dodaj posiadłość</span>
          </button>

          {/* Existing properties */}
          {allProperties.map((property, index) => {
            const upcomingCount = property.reservations?.filter(
              r => new Date(r.endDate) >= new Date()
            ).length || 0

            return (
              <div
                key={property.id}
                className={styles.card}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  {property.role === 'owner' && (
                    <Link
                      href={`/property/${property.id}/settings`}
                      className={styles.settingsBtn}
                      title="Ustawienia"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                    </Link>
                  )}
                </div>

                <h3 className={styles.cardTitle}>{property.name}</h3>

                {property.role === 'collaborator' && (
                  <span className={styles.badge}>Współzarządzanie</span>
                )}

                <div className={styles.cardStats}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{property.reservations?.length || 0}</span>
                    <span className={styles.statLabel}>Rezerwacji</span>
                  </div>
                  <div className={styles.statDivider}></div>
                  <div className={styles.stat}>
                    <span className={`${styles.statValue} ${styles.statUpcoming}`}>{upcomingCount}</span>
                    <span className={styles.statLabel}>Nadchodzące</span>
                  </div>
                </div>

                <Link href={`/property/${property.id}`} className={`btn btn-primary ${styles.cardBtn}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Otwórz kalendarz
                </Link>
              </div>
            )
          })}
        </div>

        {allProperties.length === 0 && (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <h3>Brak nieruchomości</h3>
            <p>Dodaj swoją pierwszą posiadłość, aby zacząć zarządzać terminami.</p>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Dodaj nową posiadłość">
        <form action={action} className={styles.modalForm}>
          {state?.error && <div className="error-message">{state.error}</div>}
          <div className="form-group">
            <label htmlFor="propertyName">Nazwa nieruchomości</label>
            <input
              id="propertyName"
              name="name"
              type="text"
              placeholder="np. Apartament Zakopane"
              required
              minLength={2}
              autoFocus
            />
          </div>
          <button type="submit" className={`btn btn-primary ${styles.modalSubmitBtn}`} disabled={pending}>
            {pending ? 'Dodawanie...' : 'Dodaj posiadłość'}
          </button>
        </form>
      </Modal>
    </main>
  )
}
