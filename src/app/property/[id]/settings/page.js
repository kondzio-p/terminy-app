import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/lib/dal'
import { getPropertyWithAccess } from '@/app/lib/dal'
import Navbar from '@/app/components/Navbar'
import SettingsView from './SettingsView'

export async function generateMetadata({ params }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return { title: 'Terminy' }

  const property = await getPropertyWithAccess(id, user.id)
  return {
    title: property ? `Ustawienia: ${property.name} - Terminy` : 'Nie znaleziono',
  }
}

export default async function SettingsPage({ params }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const property = await getPropertyWithAccess(id, user.id)
  if (!property || !property.isOwner) redirect('/dashboard')

  return (
    <>
      <Navbar userName={user.name} />
      <SettingsView property={property} />
    </>
  )
}
