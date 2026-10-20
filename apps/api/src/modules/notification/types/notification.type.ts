export interface BookingConfirmedJobPayload {
  bookingId: string;
}

export interface BookingCancelledJobPayload {
  bookingId: string;
  refundPercentage?: number;
  reason?: string;
}
