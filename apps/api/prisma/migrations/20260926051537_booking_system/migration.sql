-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PAYMENT_PENDING', 'CONFIRMED', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "SlotStatus" ADD VALUE 'HELD';

-- AlterTable
ALTER TABLE "availability_slots" ADD COLUMN     "heldByBookingId" TEXT,
ADD COLUMN     "heldUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "instructorProfileId" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PAYMENT_PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bookings_studentId_status_startTime_idx" ON "bookings"("studentId", "status", "startTime");

-- CreateIndex
CREATE INDEX "bookings_instructorProfileId_status_startTime_idx" ON "bookings"("instructorProfileId", "status", "startTime");

-- CreateIndex
CREATE INDEX "bookings_status_expiresAt_idx" ON "bookings"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "availability_slots_status_heldUntil_idx" ON "availability_slots"("status", "heldUntil");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "availability_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
