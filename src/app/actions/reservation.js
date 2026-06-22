'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/dal'
import { getPropertyWithAccess } from '@/app/lib/dal'

export async function createReservation(prevState, formData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Musisz być zalogowany.' }

  const propertyId = formData.get('propertyId')?.toString()
  const startDate = formData.get('startDate')?.toString()
  const endDate = formData.get('endDate')?.toString()
  const guestsCount = parseInt(formData.get('guestsCount')?.toString() || '1')
  const pricePerNight = parseFloat(formData.get('pricePerNight')?.toString() || '0')
  const description = formData.get('description')?.toString().trim() || null
  const phoneNumber = formData.get('phoneNumber')?.toString().trim() || null

  if (!startDate || !endDate) {
    return { error: 'Podaj datę rozpoczęcia i zakończenia.' }
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (end <= start) {
    return { error: 'Data zakończenia musi być po dacie rozpoczęcia.' }
  }

  if (guestsCount < 1) {
    return { error: 'Liczba gości musi wynosić co najmniej 1.' }
  }

  const property = await getPropertyWithAccess(propertyId, user.id)
  if (!property) {
    return { error: 'Nie masz dostępu do tej nieruchomości.' }
  }

  // Check for overlapping reservations (warn, don't block)
  const overlapping = await prisma.reservation.findMany({
    where: {
      propertyId,
      OR: [
        { startDate: { lte: end }, endDate: { gte: start } },
      ],
    },
  })

  await prisma.reservation.create({
    data: {
      propertyId,
      startDate: start,
      endDate: end,
      guestsCount,
      pricePerNight,
      description,
      phoneNumber,
    },
  })

  revalidatePath(`/property/${propertyId}`)

  if (overlapping.length > 0) {
    return {
      success: true,
      warning: `Uwaga: Rezerwacja nachodzi na ${overlapping.length} istniejąc${overlapping.length === 1 ? 'ą rezerwację' : 'e rezerwacje'}. Rezerwacja została mimo to dodana.`,
    }
  }

  return { success: true }
}

export async function updateReservation(prevState, formData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Musisz być zalogowany.' }

  const reservationId = formData.get('reservationId')?.toString()
  const propertyId = formData.get('propertyId')?.toString()
  const startDate = formData.get('startDate')?.toString()
  const endDate = formData.get('endDate')?.toString()
  const guestsCount = parseInt(formData.get('guestsCount')?.toString() || '1')
  const pricePerNight = parseFloat(formData.get('pricePerNight')?.toString() || '0')
  const description = formData.get('description')?.toString().trim() || null
  const phoneNumber = formData.get('phoneNumber')?.toString().trim() || null

  if (!startDate || !endDate) {
    return { error: 'Podaj datę rozpoczęcia i zakończenia.' }
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (end <= start) {
    return { error: 'Data zakończenia musi być po dacie rozpoczęcia.' }
  }

  const property = await getPropertyWithAccess(propertyId, user.id)
  if (!property) {
    return { error: 'Nie masz dostępu do tej nieruchomości.' }
  }

  // Check for overlapping reservations excluding the current one
  const overlapping = await prisma.reservation.findMany({
    where: {
      propertyId,
      id: { not: reservationId },
      OR: [
        { startDate: { lte: end }, endDate: { gte: start } },
      ],
    },
  })

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { startDate: start, endDate: end, guestsCount, pricePerNight, description, phoneNumber },
  })

  revalidatePath(`/property/${propertyId}`)
  revalidatePath(`/property/${propertyId}/settings`)

  if (overlapping.length > 0) {
    return {
      success: true,
      warning: `Uwaga: Rezerwacja nachodzi na ${overlapping.length} istniejąc${overlapping.length === 1 ? 'ą rezerwację' : 'e rezerwacje'}.`,
    }
  }

  return { success: true }
}

export async function deleteReservation(prevState, formData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Musisz być zalogowany.' }

  const reservationId = formData.get('reservationId')?.toString()
  const propertyId = formData.get('propertyId')?.toString()

  const property = await getPropertyWithAccess(propertyId, user.id)
  if (!property) {
    return { error: 'Nie masz dostępu do tej nieruchomości.' }
  }

  await prisma.reservation.delete({ where: { id: reservationId } })

  revalidatePath(`/property/${propertyId}`)
  revalidatePath(`/property/${propertyId}/settings`)
  return { success: true }
}
