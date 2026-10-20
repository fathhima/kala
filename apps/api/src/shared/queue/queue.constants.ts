export const QUEUES = {
  HOLD_EXPIRY: 'hold-expiry',
  NOTIFICATIONS: 'notifications',
} as const;

export const JOBS = {
  EXPIRE_HOLDS: 'expire-holds',
  BOOKING_CONFIRMED_NOTIFICATION: 'booking-confirmed-notification',
  BOOKING_CANCELLED_NOTIFICATION: 'booking-cancelled-notification',
} as const;
