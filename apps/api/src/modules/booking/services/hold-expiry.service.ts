import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { BOOKING_SERVICE, type IBookingService } from './interfaces/booking.service.interface';

@Injectable()
export class HoldExpiryService implements OnModuleInit, OnModuleDestroy {
    private readonly _logger = new Logger(HoldExpiryService.name);
    private _timer?: NodeJS.Timeout;

    constructor(
        @Inject(BOOKING_SERVICE)
        private readonly _bookingService: IBookingService,
    ) { }

    onModuleInit() {
        this._timer = setInterval(() => {
            this._bookingService.expireHolds().catch((error: unknown) => {
                this._logger.error('Failed to expire booking holds', error);
            });
        }, 15_000);
    }

    onModuleDestroy() {
        if (this._timer) clearInterval(this._timer);
    }
}