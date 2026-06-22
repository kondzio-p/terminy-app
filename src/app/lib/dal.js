import 'server-only'
import { getSession } from '@/app/lib/session'
import prisma from '@/app/lib/prisma'

export async function getCurrentUser() {
  const session = await getSession()
  if (!session?.userId) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true },
  })

  return user
}

export async function getUserProperties(userId) {
  const owned = await prisma.property.findMany({
    where: { ownerId: userId },
    include: {
      reservations: true,
      collaborators: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const collaborated = await prisma.property.findMany({
    where: {
      collaborators: { some: { userId } },
    },
    include: {
      reservations: true,
      owner: { select: { id: true, name: true, email: true } },
      collaborators: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return { owned, collaborated }
}

export async function getPropertyWithAccess(propertyId, userId) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      collaborators: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      reservations: {
        orderBy: { startDate: 'asc' },
      },
    },
  })

  if (!property) return null

  const isOwner = property.ownerId === userId
  const isCollaborator = property.collaborators.some(c => c.userId === userId)

  if (!isOwner && !isCollaborator) return null

  return { ...property, isOwner, isCollaborator }
}
