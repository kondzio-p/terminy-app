import { PrismaClient } from '@/generated/prisma'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis

function createPrismaClient() {
  if (!process.env.POSTGRES_PRISMA_URL) {
    // If there is no DB URL (e.g. during build), return a dummy or wait
    return new PrismaClient()
  }
  const pool = new Pool({ connectionString: process.env.POSTGRES_PRISMA_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
