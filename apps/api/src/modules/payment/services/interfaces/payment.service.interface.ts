import { PaymentQueryDto } from '../../dto/request/payment.request.dto';
import { PaymentResponseDto, CheckoutResponseDto, PaginatedPaymentsResponseDto } from '../../dto/response/payment.response.dto';
import { UserRole } from '@/shared/enums/role.enum';

export const PAYMENT_SERVICE = Symbol('PAYMENT_SERVICE');

export interface IPaymentService {
    createCheckout(studentId: string, bookingId: string): Promise<CheckoutResponseDto>;
    handleWebhook(rawBody: Buffer, signature: string): Promise<void>;
    getPayment(paymentId: string, studentId: string): Promise<PaymentResponseDto>;
    getPaymentByBooking(bookingId: string, userId: string, roles?: UserRole[]): Promise<PaymentResponseDto>;
    listStudentPayments(studentId: string, query: PaymentQueryDto): Promise<PaginatedPaymentsResponseDto>;
    listAdminPayments(query: PaymentQueryDto): Promise<PaginatedPaymentsResponseDto>;
    getAdminPayment(paymentId: string): Promise<PaymentResponseDto>;
    refundPayment(bookingId: string, actorId: string, reason?: string): Promise<PaymentResponseDto>;
    /**
     * Best-effort auto-refund triggered by booking cancellation.
     * Does NOT throw on failure — logs the error and flags payment
     * as REFUND_PENDING for admin follow-up.
     */
    processAutoRefund(bookingId: string, refundPercentage: number, reason: string): Promise<void>;
    confirmDevPayment(studentId: string, bookingId: string): Promise<PaymentResponseDto>;
    recordPaymentFailure(studentId: string, bookingId: string, reason?: string): Promise<PaymentResponseDto>;
}