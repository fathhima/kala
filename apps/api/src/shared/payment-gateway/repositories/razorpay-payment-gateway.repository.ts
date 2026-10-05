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
        try {
            // Set 8-second timeout so it never hangs for 22+ seconds if api.razorpay.com is blocked
            const orderPromise = this._razorpay.orders.create({
                amount: Math.round(input.amount * 100), // paise
                currency: input.currency.toUpperCase(),
                receipt: input.bookingId.slice(0, 40),
                notes: {
                    bookingId: input.bookingId,
                    customerEmail: input.customerEmail,
                    description: input.description.slice(0, 255),
                },
            });

            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(
                    () =>
                        reject(
                            new Error(
                                'Razorpay payment gateway connection timed out. api.razorpay.com is unreachable.',
                            ),
                        ),
                    8000,
                ),
            );

            const order = (await Promise.race([orderPromise, timeoutPromise])) as any;

            return {
                sessionId: order.id,        // e.g. "order_xxxxxxxx"
                checkoutUrl: '',            // Razorpay uses client-side modal
                gatewayKeyId: this._keyId,  // Frontend needs this to init Razorpay
            };
        } catch (error: any) {
            const rawMessage = error?.message || error?.error?.description || String(error);
            const isNetworkOrTimeout =
                rawMessage.includes('timed out') ||
                rawMessage.includes('status') ||
                rawMessage.includes('ECONN') ||
                rawMessage.includes('ETIMEDOUT') ||
                rawMessage.includes('socket hang up');

            const isDev = this._configService.get('NODE_ENV') === 'development';

            // In development mode, if the network / ISP blocks api.razorpay.com:
            if (isDev && isNetworkOrTimeout) {
                const devSessionId = `order_dev_${Date.now()}`;
                return {
                    sessionId: devSessionId,
                    checkoutUrl: '',
                    gatewayKeyId: this._keyId,
                };
            }

            throw new Error(`Razorpay gateway error: ${rawMessage}`);
        }
    }

    async createRefund(input: CreateRefundInput): Promise<RefundResult> {
        const isDev = this._configService.get('NODE_ENV') === 'development';
        const isDevPayment = input.gatewayPaymentIntentId?.startsWith('pay_dev_');

        if (isDevPayment) {
            return {
                refundId: `rfnd_dev_${Date.now()}`,
                amount: input.amount ?? 0,
                status: 'processed',
            };
        }

        try {
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
        } catch (error) {
            const rawMessage = error instanceof Error ? error.message : String(error);
            const isNetworkOrTimeout =
                rawMessage.includes('status') ||
                rawMessage.includes('ECONN') ||
                rawMessage.includes('ETIMEDOUT') ||
                rawMessage.includes('socket hang up');

            if (isDev && isNetworkOrTimeout) {
                return {
                    refundId: `rfnd_dev_${Date.now()}`,
                    amount: input.amount ?? 0,
                    status: 'processed',
                };
            }

            throw error;
        }
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