import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/app/lib/dal'
import { getUserProperties } from '@/app/lib/dal'
import Navbar from '@/app/components/Navbar'
import DashboardContent from './DashboardContent'

export const metadata = {
  title: 'Panel Główny - Terminy',
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { owned, collaborated } = await getUserProperties(user.id)

  return (
    <>
      <Navbar userName={user.name} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Link href="/dashboard/history" className="btn btn-outline">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
            <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Historia finansowa
        </Link>
      </div>
      <DashboardContent
        ownedProperties={owned}
        collaboratedProperties={collaborated}
        userId={user.id}
      />
    </>
  )
}
