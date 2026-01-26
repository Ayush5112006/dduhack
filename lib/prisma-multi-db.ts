import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing. Set it in your environment for Prisma to connect.')
}

const prismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient

export type UserRole = 'participant' | 'organizer' | 'admin' | 'judge'

/**
 * Get the appropriate Prisma client based on user role
 * Note: Currently using single database for all roles
 */
export function getPrismaClient(role?: UserRole): PrismaClient {
  return prismaClient
}

/**
 * Get all database clients (returns single client for compatibility)
 */
export function getAllDatabases() {
  return [prismaClient]
}

/**
 * Disconnect all database clients
 */
export async function disconnectAllDatabases() {
  await prismaClient.$disconnect()
}

export const prisma = prismaClient
export default prismaClient
