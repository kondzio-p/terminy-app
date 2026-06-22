'use client'

import { useState, useActionState } from 'react'
import { addCollaborator, removeCollaborator, deleteProperty } from '@/app/actions/property'
import { updateReservation, deleteReservation } from '@/app/actions/reservation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Modal from '@/app/components/Modal'
import styles from './settings.module.css'

export default function SettingsView({ property }) {
  const router = useRouter()
  const [editingReservation, setEditingReservation] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Collaborator actions
  const [collabState, collabAction, collabPending] = useActionState(addCollaborator, undefined)

  const [removeCollabState, removeCollabAction] = useActionState(removeCollaborator, undefined)

  // Reservation edit
  const [editState, editAction, editPending] = useActionState(async (prevState, formData) => {
    const result = await updateReservation(prevState, formData)
    if (result?.success) {
      setEditingReservation(null)
    }
    return result
  }, undefined)

  // Reservation delete
  const [deleteResState, deleteResAction] = useActionState(deleteReservation, undefined)

  // Property delete
  const [deleteState, deleteAction, deletePending] = useActionState(async (prevState, formData) => {
    const result = await deleteProperty(prevState, formData)
    if (result?.deleted) {
      router.push('/dashboard')
    }
    return result
  }, undefined)

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const formatDateInput = (dateStr) => {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0]
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <Link href={`/property/${property.id}`} className={styles.backBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <div>
            <h1 className={styles.title}>Ustawienia</h1>
            <p className={styles.subtitle}>{property.name}</p>
          </div>
        </div>

        {/* Collaborators Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Współzarządzanie
          </h2>
          <p className={styles.sectionDesc}>
            Dodaj innych użytkowników, aby mogli zarządzać kalendarzem tej nieruchomości.
          </p>

          <form action={collabAction} className={styles.inlineForm}>
            <input type="hidden" name="propertyId" value={property.id} />
            <input
              name="email"
              type="email"
              placeholder="Email współpracownika"
              required
              className={styles.inlineInput}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={collabPending}>
              {collabPending ? 'Dodawanie...' : 'Dodaj'}
            </button>
          </form>
          {collabState?.error && <div className="error-message">{collabState.error}</div>}
          {collabState?.success && <div className="success-message">Współpracownik został dodany!</div>}

          {property.collaborators.length > 0 && (
            <div className={styles.collaboratorsList}>
              {property.collaborators.map(collab => (
                <div key={collab.id} className={styles.collaboratorItem}>
                  <div className={styles.collaboratorInfo}>
                    <div className={styles.collaboratorAvatar}>
                      {collab.user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div className={styles.collaboratorName}>{collab.user.name}</div>
                      <div className={styles.collaboratorEmail}>{collab.user.email}</div>
                    </div>
                  </div>
                  <form action={removeCollabAction}>
                    <input type="hidden" name="collaboratorId" value={collab.id} />
                    <input type="hidden" name="propertyId" value={property.id} />
                    <button type="submit" className={`btn btn-ghost btn-sm ${styles.removeBtn}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reservations Management Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Zarządzanie terminami
          </h2>
          <p className={styles.sectionDesc}>
            Edytuj lub usuń istniejące rezerwacje.
          </p>

          {property.reservations.length === 0 ? (
            <p className={styles.emptyState}>Brak rezerwacji do wyświetlenia.</p>
          ) : (
            <div className={styles.reservationsTable}>
              {property.reservations.map(reservation => (
                <div key={reservation.id} className={styles.reservationRow}>
                  <div className={styles.reservationContent}>
                    <div className={styles.reservationDates}>
                      {formatDate(reservation.startDate)} → {formatDate(reservation.endDate)}
                    </div>
                    <div className={styles.reservationMeta}>
                      {reservation.guestsCount} {reservation.guestsCount === 1 ? 'gość' : 'gości'}
                      {reservation.description && ` • ${reservation.description}`}
                    </div>
                  </div>
                  <div className={styles.reservationActions}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setEditingReservation(reservation)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <form action={deleteResAction}>
                      <input type="hidden" name="reservationId" value={reservation.id} />
                      <input type="hidden" name="propertyId" value={property.id} />
                      <button type="submit" className={`btn btn-ghost btn-sm ${styles.removeBtn}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className={`${styles.section} ${styles.dangerSection}`}>
          <h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Strefa zagrożenia
          </h2>
          <p className={styles.sectionDesc}>
            Usunięcie nieruchomości jest nieodwracalne. Wszystkie rezerwacje i współpracownicy zostaną usunięci.
          </p>
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Usuń nieruchomość
          </button>
        </section>
      </div>

      {/* Edit Reservation Modal */}
      <Modal
        isOpen={!!editingReservation}
        onClose={() => setEditingReservation(null)}
        title="Edytuj rezerwację"
      >
        {editingReservation && (
          <form action={editAction} className={styles.editForm}>
            <input type="hidden" name="reservationId" value={editingReservation.id} />
            <input type="hidden" name="propertyId" value={property.id} />

            {editState?.error && <div className="error-message">{editState.error}</div>}
            {editState?.warning && <div className="warning-message">{editState.warning}</div>}

            <div className="form-group">
              <label htmlFor="editStartDate">Data rozpoczęcia</label>
              <input
                id="editStartDate"
                name="startDate"
                type="date"
                defaultValue={formatDateInput(editingReservation.startDate)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="editEndDate">Data zakończenia</label>
              <input
                id="editEndDate"
                name="endDate"
                type="date"
                defaultValue={formatDateInput(editingReservation.endDate)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="editGuestsCount">Liczba gości</label>
              <input
                id="editGuestsCount"
                name="guestsCount"
                type="number"
                min="1"
                defaultValue={editingReservation.guestsCount}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="editDescription">Opis (opcjonalny)</label>
              <input
                id="editDescription"
                name="description"
                type="text"
                defaultValue={editingReservation.description || ''}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={editPending}>
              {editPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </button>
          </form>
        )}
      </Modal>

      {/* Delete Property Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Potwierdź usunięcie"
      >
        <form action={deleteAction} className={styles.deleteForm}>
          <input type="hidden" name="propertyId" value={property.id} />

          {deleteState?.error && <div className="error-message">{deleteState.error}</div>}

          <p className={styles.deleteWarning}>
            Aby potwierdzić usunięcie, wpisz dokładną nazwę nieruchomości:
          </p>
          <p className={styles.deletePropertyName}>"{property.name}"</p>

          <div className="form-group">
            <input
              name="confirmName"
              type="text"
              placeholder="Wpisz nazwę nieruchomości"
              required
              autoComplete="off"
            />
          </div>

          <button type="submit" className="btn btn-danger" style={{ width: '100%' }} disabled={deletePending}>
            {deletePending ? 'Usuwanie...' : 'Potwierdzam usunięcie'}
          </button>
        </form>
      </Modal>
    </main>
  )
}
