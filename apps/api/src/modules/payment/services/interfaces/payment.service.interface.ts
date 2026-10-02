import { PaymentEntity, CheckoutEntity, PaginatedPaymentEntity } from '../../entities/payment.entity';
import { PaymentListQuery } from '../../types/payment.type';

export const PAYMENT_SERVICE = Symbol('PAYMENT_SERVICE');

export interface IPaymentService {
    createCheckout(studentId: string, bookingId: string): Promise<CheckoutEntity>;

    handleWebhook(rawBody: Buffer, signature: string): Promise<void>;

    getPayment(paymentId: string, studentId: string): Promise<PaymentEntity>;

    getPaymentByBooking(bookingId: string, studentId: string): Promise<PaymentEntity>;

    listStudentPayments(studentId: string, query: PaymentListQuery): Promise<PaginatedPaymentEntity>;

    listAdminPayments(query: PaymentListQuery): Promise<PaginatedPaymentEntity>;

    refundPayment(bookingId: string, actorId: string, reason?: string): Promise<PaymentEntity>;
}