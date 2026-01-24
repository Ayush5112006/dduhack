import { PrismaClient } from '@prisma/client'

// Role-based database clients
const studentDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_STUDENT || process.env.DATABASE_URL,
    },
  },
  log: ['warn', 'error'],
})

const organizerDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_ORGANIZER || process.env.DATABASE_URL,
    },
  },
  log: ['warn', 'error'],
})

const adminDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_ADMIN || process.env.DATABASE_URL,
    },
  },
  log: ['warn', 'error'],
})

export type UserRole = 'participant' | 'organizer' | 'admin' | 'judge'

/**
 * Get the appropriate Prisma client based on user role
 */
export function getPrismaClient(role: UserRole): PrismaClient {
  switch (role) {
    case 'organizer':
      return organizerDb
    case 'admin':
      return adminDb
    case 'participant':
    case 'judge':
    default:
      return studentDb
  }
}

/**
 * Get all database clients
 */
export const prismaClients = {
  student: studentDb,
  organizer: organizerDb,
  admin: adminDb,
}

/**
 * Close all database connections (for cleanup)
 */
export async function closeAllDatabases() {
  await Promise.all([
    studentDb.$disconnect(),
    organizerDb.$disconnect(),
    adminDb.$disconnect(),
  ])
}

// Global singleton for development
const globalForPrisma = global as unknown as { prismaMulti: typeof prismaClients }
globalForPrisma.prismaMulti = prismaClients
