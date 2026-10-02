-- Drop the old, broader partial unique index that conflicts with uq_active_booking_per_slot.
-- The old index blocked rebooking a slot that already had a COMPLETED or REFUND_PENDING booking.
-- The narrower uq_active_booking_per_slot (PAYMENT_PENDING, CONFIRMED only) is the correct one.
DROP INDEX IF EXISTS "bookings_one_active_per_slot";