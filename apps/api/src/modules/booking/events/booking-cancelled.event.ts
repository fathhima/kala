export class BookingCancelledEvent {
    constructor(
        public readonly bookingId: string,
        public readonly refundPercentage: number,
        public readonly reason: string,
    ) { }
}
