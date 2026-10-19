import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BookingCancelledEvent } from '@/modules/booking/events/booking-cancelled.event';
import { PAYMENT_SERVICE, type IPaymentService } from '../services/interfaces/payment.service.interface';

@Injectable()
export class BookingCancelledListener {
    constructor(
        @Inject(PAYMENT_SERVICE)
        private readonly _paymentService: IPaymentService,
    ) { }

    @OnEvent('booking.cancelled')
    async handleBookingCancelled(event: BookingCancelledEvent): Promise<void> {
        await this._paymentService.processAutoRefund(
            event.bookingId,
            event.refundPercentage,
            event.reason,
        );
    }
}
