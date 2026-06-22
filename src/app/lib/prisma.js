import { PrismaClient } from '@/generated/prisma'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis

function createPrismaClient() {
  // During Vercel build, POSTGRES_PRISMA_URL might be undefined.
  // Prisma 7 requires a valid adapter or URL string on initialization.
  const connectionString = process.env.POSTGRES_PRISMA_URL || "postgres://dummy:dummy@localhost:5432/dummy"
  
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
