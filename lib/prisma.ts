import { PrismaClient } from "@prisma/client"

// Prevent multiple instances in dev / HMR
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing. Set it in your environment (e.g., .env.local) for Prisma to connect."
  )
}

const prismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient
}

export const prisma = prismaClient
export default prismaClient
