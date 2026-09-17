/*
  Warnings:

  - A unique constraint covering the columns `[offeringId,startTime,endTime]` on the table `availability_slots` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "availability_slots_offeringId_startTime_endTime_key" ON "availability_slots"("offeringId", "startTime", "endTime");
