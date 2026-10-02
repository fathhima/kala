import { PaymentStatus, PaymentGateway } from '../enums/payment.enum';

export class PaymentEntity {
    id!: string;
    bookingId!: string;
    studentId!: string;
    amount!: number;
    currency!: string;
    status!: PaymentStatus;
    gateway!: PaymentGateway;
    gatewayId!: string | null;
    gatewaySessionId!: string | null;
    refundId!: string | null;
    refundAmount!: number | null;
    metadata!: Record<string, unknown> | null;
    failureReason!: string | null;
    paidAt!: Date | null;
    refundedAt!: Date | null;
    createdAt!: Date;
    updatedAt!: Date;
}

export class CheckoutEntity {
    paymentId!: string;
    checkoutUrl!: string;
    sessionId!: string;
    gatewayKeyId!: string;
}

export class PaginatedPaymentEntity {
    items!: PaymentEntity[];
    total!: number;
    page!: number;
    limit!: number;
}