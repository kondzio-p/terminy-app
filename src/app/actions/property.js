'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/app/lib/prisma'
import { getCurrentUser } from '@/app/lib/dal'

export async function createProperty(prevState, formData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Musisz być zalogowany.' }

  const name = formData.get('name')?.toString().trim()
  if (!name || name.length < 2) {
    return { error: 'Nazwa nieruchomości musi mieć co najmniej 2 znaki.' }
  }

  await prisma.property.create({
    data: { name, ownerId: user.id },
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteProperty(prevState, formData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Musisz być zalogowany.' }

  const propertyId = formData.get('propertyId')?.toString()
  const confirmName = formData.get('confirmName')?.toString().trim()

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  })

  if (!property || property.ownerId !== user.id) {
    return { error: 'Nie masz uprawnień do usunięcia tej nieruchomości.' }
  }

  if (confirmName !== property.name) {
    return { error: 'Wpisana nazwa nie jest zgodna. Spróbuj ponownie.' }
  }

  await prisma.property.delete({ where: { id: propertyId } })

  revalidatePath('/dashboard')
  return { success: true, deleted: true }
}

export async function addCollaborator(prevState, formData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Musisz być zalogowany.' }

  const propertyId = formData.get('propertyId')?.toString()
  const collaboratorEmail = formData.get('email')?.toString().trim().toLowerCase()

  if (!collaboratorEmail) {
    return { error: 'Podaj adres email współpracownika.' }
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  })

  if (!property || property.ownerId !== user.id) {
    return { error: 'Nie masz uprawnień do zarządzania tą nieruchomością.' }
  }

  const collaborator = await prisma.user.findUnique({
    where: { email: collaboratorEmail },
  })

  if (!collaborator) {
    return { error: 'Nie znaleziono użytkownika o podanym adresie email.' }
  }

  if (collaborator.id === user.id) {
    return { error: 'Nie możesz dodać siebie jako współpracownika.' }
  }

  const existing = await prisma.propertyCollaborator.findUnique({
    where: {
      propertyId_userId: { propertyId, userId: collaborator.id },
    },
  })

  if (existing) {
    return { error: 'Ten użytkownik jest już współpracownikiem.' }
  }

  await prisma.propertyCollaborator.create({
    data: { propertyId, userId: collaborator.id },
  })

  revalidatePath(`/property/${propertyId}/settings`)
  return { success: true }
}

export async function removeCollaborator(prevState, formData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Musisz być zalogowany.' }

  const collaboratorId = formData.get('collaboratorId')?.toString()
  const propertyId = formData.get('propertyId')?.toString()

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  })

  if (!property || property.ownerId !== user.id) {
    return { error: 'Nie masz uprawnień.' }
  }

  await prisma.propertyCollaborator.delete({
    where: { id: collaboratorId },
  })

  revalidatePath(`/property/${propertyId}/settings`)
  return { success: true }
}
