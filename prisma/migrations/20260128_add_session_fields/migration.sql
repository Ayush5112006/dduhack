-- AlterTable
ALTER TABLE "Session" ADD COLUMN "csrfToken" TEXT,
ADD COLUMN "fingerprint" TEXT,
ADD COLUMN "absoluteExpiresAt" TIMESTAMP(3);
