import { Module } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import {
    PAYMENT_GATEWAY_PROVIDER,
    PAYMENT_GATEWAY_SERVICE,
} from './repositories/interfaces/payment-gateway.interface';
import { RazorpayPaymentGatewayProvider } from './repositories/razorpay-payment-gateway.repository';

@Module({
    providers: [
        RazorpayPaymentGatewayProvider,
        {
            provide: PAYMENT_GATEWAY_PROVIDER,
            useExisting: RazorpayPaymentGatewayProvider,
        },
        {
            provide: PAYMENT_GATEWAY_SERVICE,
            useClass: PaymentGatewayService,
        },
    ],
    exports: [PAYMENT_GATEWAY_SERVICE],
})
export class PaymentGatewayModule { }
