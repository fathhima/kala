import { PaymentEntity, PaginatedPaymentEntity } from '../../entities/payment.entity';
import { CreatePaymentInput, ConfirmPaymentInput, PaymentListQuery } from '../../types/payment.type';

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');

export interface IPaymentRepository {
    create(input: CreatePaymentInput, gatewaySessionId: string): Promise<PaymentEntity>;

    findById(id: string): Promise<PaymentEntity | null>;

    findByBookingId(bookingId: string): Promise<PaymentEntity | null>;

    findByGatewaySessionId(sessionId: string): Promise<PaymentEntity | null>;

    /**
     * Atomically confirms a payment + booking in a single transaction.
     * Uses gatewayId unique constraint for idempotency.
     */
    confirmPayment(input: ConfirmPaymentInput): Promise<PaymentEntity>;

    /**
     * Marks a payment as refunded and cancels the booking.
     */
    refundPayment(paymentId: string, refundId: string, refundAmount: number): Promise<PaymentEntity>;

    findStudentPayments(studentId: string, query: PaymentListQuery): Promise<PaginatedPaymentEntity>;

    findAdminPayments(query: PaymentListQuery): Promise<PaginatedPaymentEntity>;
}
