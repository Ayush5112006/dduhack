const { PrismaClient } = require('@prisma/client')
const path = require('path')

// Point Prisma to admin database
process.env.DATABASE_URL = 'file:./prisma/admin.db'
const prisma = new PrismaClient()

async function main() {
  // Columns to add if missing
  const alters = [
    "ALTER TABLE User ADD COLUMN phone TEXT",
    "ALTER TABLE User ADD COLUMN otp TEXT",
    "ALTER TABLE User ADD COLUMN otpExpiresAt DATETIME",
    "ALTER TABLE User ADD COLUMN isVerified BOOLEAN DEFAULT 0"
  ]

  for (const sql of alters) {
    try {
      await prisma.$executeRawUnsafe(sql)
      console.log('OK:', sql)
    } catch (e) {
      console.log('Skip:', sql, '-', e.message)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
