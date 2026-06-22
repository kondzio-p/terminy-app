import { redirect } from 'next/navigation'
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
      <DashboardContent
        ownedProperties={owned}
        collaboratedProperties={collaborated}
        userId={user.id}
      />
    </>
  )
}
