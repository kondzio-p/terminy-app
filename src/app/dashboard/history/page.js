import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getUserProperties } from '@/app/lib/dal'
import Navbar from '@/app/components/Navbar'
import HistoryClient from './HistoryClient'
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

  return (
    <>
      <Navbar userName={user.name} />
      <main className={styles.main}>
        <div className={styles.container}>
          <HistoryClient allReservations={allReservations} />
        </div>
      </main>
    </>
  )
}
