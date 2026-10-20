import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BookingController } from './booking.controller';
import { BookingService } from './services/booking.service';
import { BOOKING_SERVICE } from './services/interfaces/booking.service.interface';
import { PrismaBookingRepository } from './repositories/prisma-booking.repository';
import { BOOKING_REPOSITORY } from './repositories/interfaces/booking.interface';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { QUEUES } from '@/shared/queue/queue.constants';
import { HoldExpiryProcessor } from './workers/hold-expiry.processor';
import { HoldExpiryScheduler } from './workers/hold-expiry.scheduler';

@Module({
    imports: [
        PrismaModule,
        BullModule.registerQueue({
            name: QUEUES.HOLD_EXPIRY,
        }),
    ],
    controllers: [BookingController],
    providers: [
        {
            provide: BOOKING_SERVICE,
            useClass: BookingService,
        },
        PrismaBookingRepository,
        {
            provide: BOOKING_REPOSITORY,
            useExisting: PrismaBookingRepository,
        },
        HoldExpiryProcessor,
        HoldExpiryScheduler,
    ],
    exports: [BOOKING_SERVICE, BOOKING_REPOSITORY],
})
export class BookingModule { }