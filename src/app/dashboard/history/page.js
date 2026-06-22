import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getUserProperties } from '@/app/lib/dal'
import Navbar from '@/app/components/Navbar'
import styles from './history.module.css'

export const metadata = {
  title: 'Historia finansowa - Terminy',
}

function calculateNights(startStr, endStr) {
  const start = new Date(startStr)
  const end = new Date(endStr)
  start.setHours(0,0,0,0)
  end.setHours(0,0,0,0)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 1
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function HistoryPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { owned, collaborated } = await getUserProperties(user.id)
  const allProperties = [...owned, ...collaborated]

  // Flatten and calculate
  let allReservations = []
  allProperties.forEach(p => {
    p.reservations.forEach(r => {
      const nights = calculateNights(r.startDate, r.endDate)
      const price = r.pricePerNight || 0
      const totalIncome = nights * price

      allReservations.push({
        ...r,
        propertyName: p.name,
        propertyId: p.id,
        nights,
        totalIncome
      })
    })
  })

  // Sort descending by start date
  allReservations.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))

  const totalGlobalIncome = allReservations.reduce((sum, r) => sum + r.totalIncome, 0)

  return (
    <>
      <Navbar userName={user.name} />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <Link href="/dashboard" className={styles.backBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </Link>
            <div>
              <h1 className={styles.title}>Historia finansowa</h1>
              <p className={styles.subtitle}>
                Łączny wygenerowany przychód: <strong>{totalGlobalIncome} zł</strong>
              </p>
            </div>
          </div>

          <div className={styles.list}>
            {allReservations.length === 0 ? (
              <div className={styles.empty}>
                <p>Nie masz jeszcze żadnych rezerwacji.</p>
              </div>
            ) : (
              allReservations.map(res => (
                <div key={res.id} className={styles.card}>
                  <div className={styles.infoLeft}>
                    <div className={styles.propertyName}>{res.propertyName}</div>
                    <div className={styles.reservationDates}>
                      {formatDate(res.startDate)} → {formatDate(res.endDate)}
                    </div>
                    {res.description && (
                      <div className={styles.description}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
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
        </div>
      </main>
    </>
  )
}
