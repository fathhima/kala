export const QUEUES = {
  HOLD_EXPIRY: 'hold-expiry',
  NOTIFICATIONS: 'notifications',
  OUTBOX: 'outbox',
} as const;

export const JOBS = {
  EXPIRE_HOLDS: 'expire-holds',
  BOOKING_CONFIRMED_NOTIFICATION: 'booking-confirmed-notification',
  BOOKING_CANCELLED_NOTIFICATION: 'booking-cancelled-notification',
  DISPATCH_OUTBOX: 'dispatch-outbox',
} as const;

export const OUTBOX_EVENT_TYPES = {
  BOOKING_HELD: 'BOOKING_HELD',
  BOOKING_CONFIRMED: 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
} as const;
