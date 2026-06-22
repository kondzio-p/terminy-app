import { redirect } from 'next/navigation'
import { getSession } from '@/app/lib/session'

export default async function Home() {
  const session = await getSession()
  if (session?.userId) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
