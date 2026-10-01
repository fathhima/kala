import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './services/booking.service';
import { BOOKING_SERVICE } from './services/interfaces/booking.service.interface';
import { PrismaBookingRepository } from './repositories/prisma-booking.repository';
import { BOOKING_REPOSITORY } from './repositories/interfaces/booking.interface';
import { PrismaModule } from '@/shared/prisma/prisma.module';

@Module({
    imports:[PrismaModule],
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
    ],
    exports: [BOOKING_SERVICE],
})
export class BookingModule {}