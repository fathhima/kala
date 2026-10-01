-- Drop the old constraint (narrower filter: AVAILABLE + BOOKED only)
ALTER TABLE availability_slots DROP CONSTRAINT IF EXISTS availability_slots_active_no_overlap;

-- Replace with broader constraint covering all non-cancelled statuses.
ALTER TABLE availability_slots
ADD CONSTRAINT no_instructor_slot_overlap
EXCLUDE USING GIST (
  "profileId" WITH =,
  tsrange("startTime", "endTime", '[)') WITH &&
)
WHERE (status != 'CANCELLED');

-- Prevent two active bookings on the same slot
CREATE UNIQUE INDEX uq_active_booking_per_slot
ON bookings ("slotId")
WHERE status IN ('PAYMENT_PENDING', 'CONFIRMED');
