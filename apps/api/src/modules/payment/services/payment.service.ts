import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, } from '@nestjs/common';
import { IPaymentService } from './interfaces/payment.service.interface';
import { PAYMENT_REPOSITORY, type IPaymentRepository, } from '../repositories/interfaces/payment.repository.interface';
import { PAYMENT_GATEWAY_SERVICE, type IPaymentGatewayService, } from '@/shared/payment-gateway/repositories/interfaces/payment-gateway.interface';
import { BOOKING_SERVICE, type IBookingService, } from '@/modules/booking/services/interfaces/booking.service.interface';
import { CheckoutEntity, PaginatedPaymentEntity, PaymentEntity } from '../entities/payment.entity';
import { PaymentListQuery } from '../types/payment.type';
import { PaymentStatus } from '../enums/payment.enum';
import { UserRole } from '@/shared/enums/role.enum';
import { type ILoggerService, LOGGER_SERVICE, } from '@/shared/logger/repositories/interfaces/logger.interface';
import { PaymentGatewayError, PaymentNotFoundError, PaymentValidationError, PaymentConflictError, } from '../errors/payment.errors';
import { ConfigService } from '@nestjs/config/dist/config.service';

@Injectable()
export class PaymentService implements IPaymentService {
    constructor(
        @Inject(PAYMENT_REPOSITORY)
        private readonly _paymentRepository: IPaymentRepository,
        @Inject(PAYMENT_GATEWAY_SERVICE)
        private readonly _paymentGateway: IPaymentGatewayService,
        @Inject(BOOKING_SERVICE)
        private readonly _bookingService: IBookingService,
        @Inject(LOGGER_SERVICE)
        private readonly _logger: ILoggerService,
        private readonly _configService: ConfigService,
    ) { }

    async createCheckout(studentId: string, bookingId: string): Promise<CheckoutEntity> {
        const booking = await this._bookingService.getBookingForPayment(bookingId, studentId);

        // Check for existing payment
        const existingPayment = await this._paymentRepository.findByBookingId(bookingId);
        if (existingPayment) {
            if (existingPayment.status === PaymentStatus.SUCCEEDED) {
                throw new BadRequestException('Payment has already been completed for this booking');
            }

            // Reuse existing pending/processing order instead of creating a duplicate
            if (
                existingPayment.status === PaymentStatus.PENDING ||
                existingPayment.status === PaymentStatus.PROCESSING
            ) {
                const entity = new CheckoutEntity();
                entity.paymentId = existingPayment.id;
                entity.checkoutUrl = '';
                entity.sessionId = existingPayment.gatewaySessionId ?? '';
                entity.gatewayKeyId = this._configService.getOrThrow<string>('RAZORPAY_KEY_ID');
                return entity;
            }
        }

        try {
            const checkoutResult = await this._paymentGateway.createCheckoutSession({
                amount: booking.amount,
                currency: booking.currency,
                bookingId: booking.id,
                customerEmail: booking.student.email,
                description: `Booking: ${booking.offering.subcategory.name} session with instructor`,
            });

            const payment = await this._paymentRepository.create(
                {
                    bookingId: booking.id,
                    studentId,
                    amount: booking.amount,
                    currency: booking.currency,
                },
                checkoutResult.sessionId,
            );

            const entity = new CheckoutEntity();
            entity.paymentId = payment.id;
            entity.checkoutUrl = checkoutResult.checkoutUrl;
            entity.sessionId = checkoutResult.sessionId;
            entity.gatewayKeyId = checkoutResult.gatewayKeyId ?? '';
            return entity;
        } catch (error) {
            this._translateDomainError(error);
        }
    }

    async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
        let event;

        try {
            event = this._paymentGateway.constructWebhookEvent(rawBody, signature);
        } catch (error) {
            this._logger.error(
                'Webhook signature verification failed',
                error instanceof Error ? error.stack : String(error),
                PaymentService.name,
            );
            throw new BadRequestException('Invalid webhook signature');
        }

        this._logger.log(`Processing webhook event: ${event.type}`, PaymentService.name,);

        switch (event.type) {
            case 'checkout.session.completed':
            case 'payment.captured':
            case 'order.paid':
                await this._handleCheckoutCompleted(
                    event.gatewaySessionId,
                    event.gatewayPaymentIntentId,
                );
                break;
            case 'payment.failed':
                await this._handlePaymentFailed(
                    event.gatewaySessionId,
                    event.gatewayPaymentIntentId,
                    event.failureReason,
                );
                break;
            case 'refund.processed':
                await this._handleRefundProcessed(
                    event.gatewayPaymentIntentId,
                    event.gatewayRefundId,
                    event.amount,
                );
                break;
            case 'refund.failed':
                await this._handleRefundFailed(
                    event.gatewayPaymentIntentId,
                    event.gatewayRefundId,
                    event.failureReason,
                );
                break;
            default:
                this._logger.log(`Unhandled webhook event type: ${event.type}`, PaymentService.name,);
        }
    }

    async getPayment(paymentId: string, studentId: string): Promise<PaymentEntity> {
        const payment = await this._paymentRepository.findById(paymentId);

        if (!payment || payment.studentId !== studentId) {
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }

    async getPaymentByBooking(
        bookingId: string,
        userId: string,
        roles?: UserRole[],
    ): Promise<PaymentEntity> {
        if (roles && roles.length > 0) {
            await this._bookingService.getById(userId, roles, bookingId);
        }

        const payment = await this._paymentRepository.findByBookingId(bookingId);

        if (!payment) {
            throw new NotFoundException('Payment not found for this booking');
        }

        if (!roles || roles.length === 0) {
            if (payment.studentId !== userId) {
                throw new NotFoundException('Payment not found for this booking');
            }
        }

        return payment;
    }

    async listStudentPayments(studentId: string, query: PaymentListQuery,): Promise<PaginatedPaymentEntity> {
        return this._paymentRepository.findStudentPayments(studentId, query);
    }

    async listAdminPayments(query: PaymentListQuery): Promise<PaginatedPaymentEntity> {
        return this._paymentRepository.findAdminPayments(query);
    }

    async getAdminPayment(paymentId: string): Promise<PaymentEntity> {
        const payment = await this._paymentRepository.findById(paymentId);

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }

    async refundPayment(bookingId: string, actorId: string, reason?: string,): Promise<PaymentEntity> {
        const payment = await this._paymentRepository.findByBookingId(bookingId);

        if (!payment) {
            throw new NotFoundException('No payment found for this booking');
        }

        if (payment.status !== PaymentStatus.SUCCEEDED) {
            throw new BadRequestException('Only succeeded payments can be refunded');
        }

        if (!payment.gatewayId) {
            throw new BadRequestException('Payment has no gateway reference for refund');
        }

        try {
            const refundResult = await this._paymentGateway.createRefund({
                gatewayPaymentIntentId: payment.gatewayId,
                reason,
            });

            return await this._paymentRepository.refundPayment(payment.id, refundResult.refundId, refundResult.amount,);
        } catch (error) {
            this._translateDomainError(error);
        }
    }

    // ─── Add this method after refundPayment() ─────────────────────

    async processAutoRefund(bookingId: string, refundPercentage: number, reason: string,): Promise<void> {
        // Find the succeeded payment for this booking
        const payment = await this._paymentRepository.findByBookingId(bookingId);

        if (!payment || payment.status !== PaymentStatus.SUCCEEDED) {
            // No succeeded payment to refund (e.g. PAYMENT_PENDING hold was cancelled)
            return;
        }

        if (!payment.gatewayId) {
            this._logger.warn(`Auto-refund skipped: payment ${payment.id} has no gatewayId`,PaymentService.name,);
            await this._paymentRepository.markRefundPending(payment.id);
            return;
        }

        const refundAmount = refundPercentage === 100
            ? payment.amount
            : Math.round(payment.amount * (refundPercentage / 100) * 100) / 100;

        try {
            const refundResult = await this._paymentGateway.createRefund({
                gatewayPaymentIntentId: payment.gatewayId,
                amount: refundAmount,
                reason,
            });

            await this._paymentRepository.markRefunded(
                payment.id,
                refundResult.refundId,
                refundResult.amount,
                refundPercentage < 100,
            );

            this._logger.log(
                `Auto-refund processed: booking=${bookingId} payment=${payment.id} ` +
                `percentage=${refundPercentage}% amount=${refundResult.amount}`,
                PaymentService.name,
            );
        } catch (error) {
            // Best-effort: don't let refund failure break the cancellation flow.
            // Flag as REFUND_PENDING so admin can manually retry.
            this._logger.error(
                `Auto-refund failed for booking=${bookingId} payment=${payment.id}: ` +
                `flagging as REFUND_PENDING for admin review`,
                error instanceof Error ? error.stack : String(error),
                PaymentService.name,
            );

            try {
                await this._paymentRepository.markRefundPending(payment.id);
            } catch (flagError) {
                this._logger.error(
                    `Failed to flag payment ${payment.id} as REFUND_PENDING`,
                    flagError instanceof Error ? flagError.stack : String(flagError),
                    PaymentService.name,
                );
            }
        }
    }

    async confirmDevPayment(studentId: string, bookingId: string): Promise<PaymentEntity> {
        if (this._configService.get('NODE_ENV') !== 'development') {
            throw new BadRequestException('Development payment simulation is only available in development mode');
        }

        const payment = await this._paymentRepository.findByBookingId(bookingId);
        if (!payment || payment.studentId !== studentId) {
            throw new NotFoundException('Payment record not found for this booking');
        }

        const confirmed = await this._paymentRepository.confirmPayment({
            gatewaySessionId: payment.gatewaySessionId ?? `order_dev_${Date.now()}`,
            gatewayPaymentIntentId: `pay_dev_${Date.now()}`,
        });

        this._logger.log(
            `Dev payment simulated & confirmed for booking=${bookingId} payment=${payment.id}`,
            PaymentService.name,
        );

        return confirmed;
    }

    async recordPaymentFailure(studentId: string, bookingId: string, reason?: string): Promise<PaymentEntity> {
        const payment = await this._paymentRepository.findByBookingId(bookingId);

        if (!payment || payment.studentId !== studentId) {
            throw new NotFoundException('Payment not found');
        }

        if (payment.status === PaymentStatus.SUCCEEDED) {
            return payment;
        }

        const failed = await this._paymentRepository.failPayment(
            payment.gatewaySessionId ?? '',
            payment.gatewayId ?? undefined,
            reason ?? 'Payment failed or was declined',
        );

        return failed ?? payment;
    }

    private async _handleCheckoutCompleted(gatewaySessionId: string, gatewayPaymentIntentId: string,): Promise<void> {
        try {
            await this._paymentRepository.confirmPayment({
                gatewaySessionId,
                gatewayPaymentIntentId,
            });

            this._logger.log(`Payment confirmed for session: ${gatewaySessionId}`, PaymentService.name,);
        } catch (error) {
            if (error instanceof PaymentNotFoundError) {
                this._logger.warn(`Webhook received for unknown session: ${gatewaySessionId}`, PaymentService.name,);
                return;
            }
            throw error;
        }
    }

    private async _handlePaymentFailed(gatewaySessionId: string, gatewayPaymentIntentId?: string, failureReason?: string,
    ): Promise<void> {
        const payment = await this._paymentRepository.failPayment(gatewaySessionId, gatewayPaymentIntentId, failureReason,);

        if (!payment) {
            this._logger.warn(`payment.failed webhook received for unknown session: ${gatewaySessionId}`, PaymentService.name,);
            return;
        }

        this._logger.warn(`Payment marked as FAILED for session ${gatewaySessionId}: ${failureReason}`, PaymentService.name,);
    }

    private async _handleRefundProcessed(gatewayPaymentIntentId: string, gatewayRefundId?: string, amount?: number,): Promise<void> {
        const payment = await this._paymentRepository.confirmRefundWebhook(gatewayPaymentIntentId, gatewayRefundId, amount,);

        if (!payment) {
            this._logger.warn(`refund.processed webhook received for unknown payment: ${gatewayPaymentIntentId}`,
                PaymentService.name,);
            return;
        }

        this._logger.log(`Refund confirmed via webhook for payment ${payment.id} (refund: ${gatewayRefundId})`,
            PaymentService.name,);
    }

    private async _handleRefundFailed(gatewayPaymentIntentId: string, gatewayRefundId?: string, failureReason?: string,)
        : Promise<void> {
        const payment = await this._paymentRepository.failRefundWebhook(gatewayPaymentIntentId, gatewayRefundId, failureReason,);

        if (!payment) {
            this._logger.warn(`refund.failed webhook received for unknown payment: ${gatewayPaymentIntentId}`,
                PaymentService.name,);
            return;
        }

        this._logger.error(`Refund failed via webhook for payment ${payment.id}: ${failureReason}. Status reverted to SUCCEEDED for admin action.`, '', PaymentService.name,);
    }

    private _translateDomainError(error: unknown): never {
        if (error instanceof PaymentNotFoundError) throw new NotFoundException(error.message);
        if (error instanceof PaymentConflictError) throw new BadRequestException(error.message);
        if (error instanceof PaymentValidationError) throw new BadRequestException(error.message);
        if (error instanceof PaymentGatewayError)
            throw new InternalServerErrorException(error.message);
        throw error as Error;
    }
}