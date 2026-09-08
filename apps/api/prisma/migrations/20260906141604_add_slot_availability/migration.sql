/*
  Warnings:

  - You are about to drop the column `portfolioUrl` on the `instructor_profiles` table. All the data in the column will be lost.
  - You are about to drop the `bookings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_slotId_fkey";

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_studentId_fkey";

-- DropIndex
DROP INDEX "availability_slots_profileId_startTime_idx";

-- AlterTable
ALTER TABLE "instructor_profiles" DROP COLUMN "portfolioUrl";

-- DropTable
DROP TABLE "bookings";

-- DropEnum
DROP TYPE "BookingStatus";
