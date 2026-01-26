import { PrismaClient } from "@prisma/client";

// Avoid multiple PrismaClient instances in Next.js (dev + hot reload)
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Missing DATABASE_URL. Set it in .env.local (postgresql://user:pass@host:port/db)."
    );
  }

  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
