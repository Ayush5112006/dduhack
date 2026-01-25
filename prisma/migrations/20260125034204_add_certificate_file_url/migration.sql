/*
  Warnings:

  - A unique constraint covering the columns `[hackathonId,userId]` on the table `Certificate` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN "fileUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_hackathonId_userId_key" ON "Certificate"("hackathonId", "userId");
