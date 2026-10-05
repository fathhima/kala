import { PaymentEntity, CheckoutEntity, PaginatedPaymentEntity } from '../../entities/payment.entity';
import { PaymentListQuery } from '../../types/payment.type';
import { UserRole } from '@/shared/enums/role.enum';

export const PAYMENT_SERVICE = Symbol('PAYMENT_SERVICE');

export interface IPaymentService {
    createCheckout(studentId: string, bookingId: string): Promise<CheckoutEntity>;

    handleWebhook(rawBody: Buffer, signature: string): Promise<void>;

    getPayment(paymentId: string, studentId: string): Promise<PaymentEntity>;

    getPaymentByBooking(bookingId: string, userId: string, roles?: UserRole[]): Promise<PaymentEntity>;

    listStudentPayments(studentId: string, query: PaymentListQuery): Promise<PaginatedPaymentEntity>;

    listAdminPayments(query: PaymentListQuery): Promise<PaginatedPaymentEntity>;

    getAdminPayment(paymentId: string): Promise<PaymentEntity>;

    refundPayment(bookingId: string, actorId: string, reason?: string): Promise<PaymentEntity>;

    /**
     * Best-effort auto-refund triggered by booking cancellation.
     * Does NOT throw on failure — logs the error and flags payment
     * as REFUND_PENDING for admin follow-up.
     */
    processAutoRefund(bookingId: string, refundPercentage: number, reason: string,): Promise<void>;

    confirmDevPayment(studentId: string, bookingId: string): Promise<PaymentEntity>;

    recordPaymentFailure(studentId: string, bookingId: string, reason?: string): Promise<PaymentEntity>;
}