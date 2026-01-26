import { PrismaClient } from '@prisma/client'

// Single shared database client with proper configuration
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClient = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
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

// Export the default client
export const prisma = prismaClient
export default prismaClient
