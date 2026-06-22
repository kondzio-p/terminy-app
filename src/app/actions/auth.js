'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import prisma from '@/app/lib/prisma'
import { createSession, deleteSession } from '@/app/lib/session'

export async function signup(prevState, formData) {
  const name = formData.get('name')?.toString().trim()
  const email = formData.get('email')?.toString().trim().toLowerCase()
  const password = formData.get('password')?.toString()

  if (!name || name.length < 2) {
    return { error: 'Imię musi mieć co najmniej 2 znaki.' }
  }
  if (!email || !email.includes('@')) {
    return { error: 'Podaj prawidłowy adres email.' }
  }
  if (!password || password.length < 6) {
    return { error: 'Hasło musi mieć co najmniej 6 znaków.' }
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: 'Użytkownik z tym adresem email już istnieje.' }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  })

  await createSession(user.id)
  redirect('/dashboard')
}

export async function login(prevState, formData) {
  const email = formData.get('email')?.toString().trim().toLowerCase()
  const password = formData.get('password')?.toString()

  if (!email || !password) {
    return { error: 'Podaj email i hasło.' }
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: 'Nieprawidłowy email lub hasło.' }
  }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    return { error: 'Nieprawidłowy email lub hasło.' }
  }

  await createSession(user.id)
  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
