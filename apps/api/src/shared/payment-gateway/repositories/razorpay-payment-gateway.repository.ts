// shared/payment-gateway/repositories/razorpay-payment-gateway.repository.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils';
import { IPaymentGatewayProvider } from './interfaces/payment-gateway.interface';
import { CreateCheckoutInput } from '../types/create-checkout.type';
import { CheckoutSession } from '../types/checkout-session.type';
import { CreateRefundInput } from '../types/create-refund.type';
import { RefundResult } from '../types/refund-result.type';
import { WebhookEvent } from '../types/webhook-event.type';

@Injectable()
export class RazorpayPaymentGatewayProvider implements IPaymentGatewayProvider {
    private readonly _razorpay: Razorpay;
    private readonly _webhookSecret: string;
    private readonly _keyId: string;

    constructor(private readonly _configService: ConfigService) {
        this._keyId = this._configService.getOrThrow<string>('RAZORPAY_KEY_ID');
        this._razorpay = new Razorpay({
            key_id: this._keyId,
            key_secret: this._configService.getOrThrow<string>('RAZORPAY_KEY_SECRET'),
        });
        this._webhookSecret = this._configService.getOrThrow<string>('RAZORPAY_WEBHOOK_SECRET');
    }

    async createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSession> {
        const order = await this._razorpay.orders.create({
            amount: Math.round(input.amount * 100), // paise
            currency: input.currency.toUpperCase(),
            receipt: input.bookingId,
            notes: {
                bookingId: input.bookingId,
                customerEmail: input.customerEmail,
                description: input.description,
            },
        });

        return {
            sessionId: order.id,        // e.g. "order_xxxxxxxx"
            checkoutUrl: '',            // Razorpay uses client-side modal
            gatewayKeyId: this._keyId,  // Frontend needs this to init Razorpay
        };
    }

    async createRefund(input: CreateRefundInput): Promise<RefundResult> {
        const refund = await this._razorpay.payments.refund(
            input.gatewayPaymentIntentId,
            {
                amount: input.amount ? Math.round(input.amount * 100) : undefined,
                notes: { reason: input.reason ?? 'requested_by_customer' },
            },
        );

        return {
            refundId: refund.id,
            amount: (refund.amount ?? 0) / 100,
            status: refund.status ?? 'unknown',
        };
    }

    constructWebhookEvent(rawBody: Buffer, signature: string): WebhookEvent {
        const isValid = validateWebhookSignature(rawBody.toString(), signature, this._webhookSecret,);

        if (!isValid) {
            throw new Error('Invalid Razorpay webhook signature');
        }

        const payload = JSON.parse(rawBody.toString());
        const eventType: string = payload.event;

        // 1. Success events
        if (eventType === 'payment.captured' || eventType === 'order.paid') {
            const payment = payload.payload?.payment?.entity;
            const orderId: string = payment?.order_id ?? '';

            return {
                type: eventType,
                gatewaySessionId: orderId,
                gatewayPaymentIntentId: payment?.id ?? '',
                amount: (payment?.amount ?? 0) / 100,
                currency: (payment?.currency ?? '').toUpperCase(),
                metadata: (payment?.notes ?? {}) as Record<string, string>,
            };
        }

        // 2. Payment failed
        if (eventType === 'payment.failed') {
            const payment = payload.payload?.payment?.entity;
            const orderId: string = payment?.order_id ?? '';

            return {
                type: eventType,
                gatewaySessionId: orderId,
                gatewayPaymentIntentId: payment?.id ?? '',
                amount: (payment?.amount ?? 0) / 100,
                currency: (payment?.currency ?? '').toUpperCase(),
                metadata: (payment?.notes ?? {}) as Record<string, string>,
                failureReason:
                    payment?.error_description ||
                    payment?.error_reason ||
                    'Payment failed at gateway',
            };
        }

        // 3. Refund processed / failed
        if (eventType === 'refund.processed' || eventType === 'refund.failed') {
            const refund = payload.payload?.refund?.entity;
            return {
                type: eventType,
                gatewaySessionId: '',
                gatewayPaymentIntentId: refund?.payment_id ?? '',
                gatewayRefundId: refund?.id ?? '',
                amount: (refund?.amount ?? 0) / 100,
                currency: (refund?.currency ?? '').toUpperCase(),
                metadata: (refund?.notes ?? {}) as Record<string, string>,
                failureReason:
                    refund?.error_description ||
                    refund?.error_reason ||
                    (eventType === 'refund.failed' ? 'Refund failed by issuing bank' : undefined),
            };
        }

        return {
            type: eventType,
            gatewaySessionId: '',
            gatewayPaymentIntentId: '',
            amount: 0,
            currency: '',
            metadata: {},
        };
    }
}