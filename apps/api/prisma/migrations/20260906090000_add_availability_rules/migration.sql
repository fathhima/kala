-- CreateEnum
CREATE TYPE "AvailabilityRuleStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AvailabilityExceptionType" AS ENUM ('BLOCK', 'EXTRA');

-- CreateEnum
CREATE TYPE "AvailabilityExceptionStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "availability_slots"
ADD COLUMN "ruleId" TEXT,
ADD COLUMN "exceptionId" TEXT;

-- CreateTable
CREATE TABLE "availability_rules" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "title" TEXT,
    "weekday" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "slotDurationMinutes" INTEGER NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveUntil" TIMESTAMP(3),
    "status" "AvailabilityRuleStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_exceptions" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "offeringId" TEXT,
    "type" "AvailabilityExceptionType" NOT NULL,
    "title" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "slotDurationMinutes" INTEGER,
    "status" "AvailabilityExceptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "availability_slots_profileId_status_startTime_idx" ON "availability_slots"("profileId", "status", "startTime");

-- CreateIndex
CREATE INDEX "availability_slots_ruleId_status_startTime_idx" ON "availability_slots"("ruleId", "status", "startTime");

-- CreateIndex
CREATE INDEX "availability_slots_exceptionId_status_startTime_idx" ON "availability_slots"("exceptionId", "status", "startTime");

-- CreateIndex
CREATE INDEX "availability_rules_profileId_status_weekday_idx" ON "availability_rules"("profileId", "status", "weekday");

-- CreateIndex
CREATE INDEX "availability_rules_offeringId_status_idx" ON "availability_rules"("offeringId", "status");

-- CreateIndex
CREATE INDEX "availability_exceptions_profileId_status_startTime_idx" ON "availability_exceptions"("profileId", "status", "startTime");

-- CreateIndex
CREATE INDEX "availability_exceptions_offeringId_status_idx" ON "availability_exceptions"("offeringId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "availability_slots_ruleId_startTime_key" ON "availability_slots"("ruleId", "startTime") WHERE "ruleId" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "availability_slots_exceptionId_startTime_key" ON "availability_slots"("exceptionId", "startTime") WHERE "exceptionId" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "availability_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_exceptionId_fkey" FOREIGN KEY ("exceptionId") REFERENCES "availability_exceptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "instructor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "instructor_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_exceptions" ADD CONSTRAINT "availability_exceptions_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "instructor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_exceptions" ADD CONSTRAINT "availability_exceptions_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "instructor_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep future booking inventory conflict-safe at the database level.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "availability_slots"
ADD CONSTRAINT "availability_slots_active_no_overlap"
EXCLUDE USING gist (
    "profileId" WITH =,
    tsrange("startTime", "endTime", '[)') WITH &&
)
WHERE ("status" IN ('AVAILABLE', 'BOOKED'));
