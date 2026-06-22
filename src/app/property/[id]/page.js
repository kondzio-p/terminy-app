import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/app/lib/dal'
import { getPropertyWithAccess } from '@/app/lib/dal'
import Navbar from '@/app/components/Navbar'
import PropertyView from './PropertyView'

export async function generateMetadata({ params }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return { title: 'Terminy' }

  const property = await getPropertyWithAccess(id, user.id)
  return {
    title: property ? `${property.name} - Terminy` : 'Nie znaleziono - Terminy',
  }
}

export default async function PropertyPage({ params }) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const property = await getPropertyWithAccess(id, user.id)
  if (!property) redirect('/dashboard')

  return (
    <>
      <Navbar userName={user.name} />
      <PropertyView property={property} />
    </>
  )
}
