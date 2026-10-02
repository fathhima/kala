import { Inject, Injectable } from '@nestjs/common';
import {IPaymentGatewayService,PAYMENT_GATEWAY_PROVIDER,type IPaymentGatewayProvider,} from './repositories/interfaces/payment-gateway.interface';
import { CreateCheckoutInput } from './types/create-checkout.type';
import { CheckoutSession } from './types/checkout-session.type';
import { CreateRefundInput } from './types/create-refund.type';
import { RefundResult } from './types/refund-result.type';
import { WebhookEvent } from './types/webhook-event.type';

@Injectable()
export class PaymentGatewayService implements IPaymentGatewayService {
    constructor(
        @Inject(PAYMENT_GATEWAY_PROVIDER)
        private readonly _paymentGatewayProvider: IPaymentGatewayProvider,
    ) { }

    createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSession> {
        return this._paymentGatewayProvider.createCheckoutSession(input);
    }

    createRefund(input: CreateRefundInput): Promise<RefundResult> {
        return this._paymentGatewayProvider.createRefund(input);
    }

    constructWebhookEvent(rawBody: Buffer, signature: string): WebhookEvent {
        return this._paymentGatewayProvider.constructWebhookEvent(rawBody, signature);
    }
}
