import {
    BadRequestException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { IPaymentService } from './interfaces/payment.service.interface';
import {
    PAYMENT_REPOSITORY,
    type IPaymentRepository,
} from '../repositories/interfaces/payment.repository.interface';
import {
    PAYMENT_GATEWAY_SERVICE,
    type IPaymentGatewayService,
} from '@/shared/payment-gateway/repositories/interfaces/payment-gateway.interface';
import {
    BOOKING_SERVICE,
    type IBookingService,
} from '@/modules/booking/services/interfaces/booking.service.interface';
import { CheckoutEntity, PaginatedPaymentEntity, PaymentEntity } from '../entities/payment.entity';
import { PaymentListQuery } from '../types/payment.type';
import { PaymentStatus } from '../enums/payment.enum';
import { BookingStatus } from '@/modules/booking/enums/booking.enum';
import {
    type ILoggerService,
    LOGGER_SERVICE,
} from '@/shared/logger/repositories/interfaces/logger.interface';
import {
    PaymentGatewayError,
    PaymentNotFoundError,
    PaymentValidationError,
    PaymentConflictError,
} from '../errors/payment.errors';

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
    ) { }

    async createCheckout(studentId: string, bookingId: string): Promise<CheckoutEntity> {
        const booking = await this._bookingService.getBookingForPayment(bookingId, studentId);

        // Check for existing pending payment
        const existingPayment = await this._paymentRepository.findByBookingId(bookingId);
        if (existingPayment && existingPayment.status === PaymentStatus.SUCCEEDED) {
            throw new BadRequestException('Payment has already been completed for this booking');
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

        this._logger.log(
            `Processing webhook event: ${event.type}`,
            PaymentService.name,
        );

        switch (event.type) {
            case 'checkout.session.completed':
            case 'payment.captured':
            case 'order.paid':
                await this._handleCheckoutCompleted(
                    event.gatewaySessionId,
                    event.gatewayPaymentIntentId,
                );
                break;
            default:
                this._logger.log(
                    `Unhandled webhook event type: ${event.type}`,
                    PaymentService.name,
                );
        }
    }

    async getPayment(paymentId: string, studentId: string): Promise<PaymentEntity> {
        const payment = await this._paymentRepository.findById(paymentId);

        if (!payment || payment.studentId !== studentId) {
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }

    async getPaymentByBooking(bookingId: string, studentId: string): Promise<PaymentEntity> {
        const payment = await this._paymentRepository.findByBookingId(bookingId);

        if (!payment || payment.studentId !== studentId) {
            throw new NotFoundException('Payment not found for this booking');
        }

        return payment;
    }

    async listStudentPayments(
        studentId: string, query: PaymentListQuery,
    ): Promise<PaginatedPaymentEntity> {
        return this._paymentRepository.findStudentPayments(studentId, query);
    }

    async listAdminPayments(query: PaymentListQuery): Promise<PaginatedPaymentEntity> {
        return this._paymentRepository.findAdminPayments(query);
    }

    async refundPayment(
        bookingId: string, actorId: string, reason?: string,
    ): Promise<PaymentEntity> {
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

            return await this._paymentRepository.refundPayment(
                payment.id,
                refundResult.refundId,
                refundResult.amount,
            );
        } catch (error) {
            this._translateDomainError(error);
        }
    }

    private async _handleCheckoutCompleted(
        gatewaySessionId: string,
        gatewayPaymentIntentId: string,
    ): Promise<void> {
        try {
            await this._paymentRepository.confirmPayment({
                gatewaySessionId,
                gatewayPaymentIntentId,
            });

            this._logger.log(
                `Payment confirmed for session: ${gatewaySessionId}`,
                PaymentService.name,
            );
        } catch (error) {
            if (error instanceof PaymentNotFoundError) {
                this._logger.warn(
                    `Webhook received for unknown session: ${gatewaySessionId}`,
                    PaymentService.name,
                );
                return;
            }
            throw error;
        }
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