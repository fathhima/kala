import { CreateCheckoutInput } from '../../types/create-checkout.type';
import { CheckoutSession } from '../../types/checkout-session.type';
import { CreateRefundInput } from '../../types/create-refund.type';
import { RefundResult } from '../../types/refund-result.type';
import { WebhookEvent } from '../../types/webhook-event.type';

export const PAYMENT_GATEWAY_PROVIDER = Symbol('PAYMENT_GATEWAY_PROVIDER');
export const PAYMENT_GATEWAY_SERVICE = Symbol('PAYMENT_GATEWAY_SERVICE');

export interface IPaymentGatewayProvider {
    createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSession>;

    createRefund(input: CreateRefundInput): Promise<RefundResult>;

    constructWebhookEvent(rawBody: Buffer, signature: string): WebhookEvent;
}

export type IPaymentGatewayService = IPaymentGatewayProvider;