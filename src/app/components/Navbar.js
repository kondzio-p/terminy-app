'use client'

import { logout } from '@/app/actions/auth'
import styles from './Navbar.module.css'
import Link from 'next/link'

export default function Navbar({ userName }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/dashboard" className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>Terminy</span>
        </Link>

        <div className={styles.right}>
          <div className={styles.user}>
            <div className={styles.avatar}>
              {userName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <span className={styles.userName}>{userName}</span>
          </div>
          <form action={logout}>
            <button type="submit" className={styles.logoutBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Wyloguj</span>
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
