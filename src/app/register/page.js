'use client'

import { useActionState } from 'react'
import { signup } from '@/app/actions/auth'
import Link from 'next/link'
import styles from '../login/auth.module.css'

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logoIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <h1 className={styles.title}>Stwórz konto</h1>
          <p className={styles.subtitle}>Zacznij zarządzać terminami swoich nieruchomości</p>
        </div>

        <form action={action} className={styles.form}>
          {state?.error && (
            <div className="error-message">{state.error}</div>
          )}

          <div className="form-group">
            <label htmlFor="name">Imię i nazwisko</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Jan Kowalski"
              required
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Adres email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="jan@przykład.pl"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Hasło</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 6 znaków"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={pending}>
            {pending ? (
              <>
                <span className={styles.spinner}></span>
                Tworzenie konta...
              </>
            ) : 'Zarejestruj się'}
          </button>
        </form>

        <p className={styles.footer}>
          Masz już konto? <Link href="/login" className={styles.link}>Zaloguj się</Link>
        </p>
      </div>
    </div>
  )
}
