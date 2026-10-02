import { forwardRef, Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './services/payment.service';
import { PAYMENT_SERVICE } from './services/interfaces/payment.service.interface';
import { PrismaPaymentRepository } from './repositories/prisma-payment.repository';
import { PAYMENT_REPOSITORY } from './repositories/interfaces/payment.repository.interface';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { BookingModule } from '@/modules/booking/booking.module';
import { PaymentGatewayModule } from '@/shared/payment-gateway/payment-gateway.module';

@Module({
    imports: [PrismaModule, forwardRef(() => BookingModule), PaymentGatewayModule],
    controllers: [PaymentController],
    providers: [
        {
            provide: PAYMENT_SERVICE,
            useClass: PaymentService,
        },
        PrismaPaymentRepository,
        {
            provide: PAYMENT_REPOSITORY,
            useExisting: PrismaPaymentRepository,
        },
    ],
    exports: [PAYMENT_SERVICE],
})
export class PaymentModule { }