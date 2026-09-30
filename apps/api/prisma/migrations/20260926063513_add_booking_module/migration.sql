/*
  Warnings:

  - You are about to drop the column `amountMinor` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `instructorProfileId` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `amount` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationMinutes` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `holdExpiresAt` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hourlyRate` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileId` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BookingStatus" ADD VALUE 'REFUND_PENDING';
ALTER TYPE "BookingStatus" ADD VALUE 'REFUNDED';

-- DropIndex
DROP INDEX "bookings_instructorProfileId_status_startTime_idx";

-- DropIndex
DROP INDEX "bookings_status_expiresAt_idx";

-- DropIndex
DROP INDEX "bookings_studentId_status_startTime_idx";

-- AlterTable
ALTER TABLE "availability_slots" ADD COLUMN     "heldByUserId" TEXT;

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "amountMinor",
DROP COLUMN "endTime",
DROP COLUMN "expiresAt",
DROP COLUMN "instructorProfileId",
DROP COLUMN "startTime",
DROP COLUMN "timezone",
ADD COLUMN     "amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledBy" TEXT,
ADD COLUMN     "durationMinutes" INTEGER NOT NULL,
ADD COLUMN     "holdExpiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "hourlyRate" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "profileId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "bookings_studentId_status_createdAt_idx" ON "bookings"("studentId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "bookings_profileId_status_createdAt_idx" ON "bookings"("profileId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "bookings_slotId_status_idx" ON "bookings"("slotId", "status");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "instructor_offerings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "instructor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TYPE "SlotStatus" ADD VALUE IF NOT EXISTS 'HELD';

CREATE UNIQUE INDEX "bookings_one_active_per_slot"
ON "bookings" ("slotId")
WHERE status IN ('PAYMENT_PENDING', 'CONFIRMED', 'COMPLETED', 'REFUND_PENDING');

CREATE INDEX "availability_slots_held_until_idx"
ON "availability_slots" ("heldUntil")
WHERE status = 'HELD';