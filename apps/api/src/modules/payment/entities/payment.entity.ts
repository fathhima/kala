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

export class InstructorPaymentSummaryEntity {
    totalEarned!: number;
    paidCount!: number;
    thisMonthEarned!: number;
    totalRefunded!: number;
    refundedCount!: number;
    pendingAmount!: number;
    pendingCount!: number;
}

export class InstructorPaymentItemEntity extends PaymentEntity {
    bookingStatus!: string;
    offeringTitle!: string;
    slotStartTime!: Date;
    slotEndTime!: Date;
    durationMinutes!: number;
    student!: {
        id: string;
        name: string;
        imageUrl: string | null;
    };
}

export class InstructorPaymentsPageEntity {
    summary!: InstructorPaymentSummaryEntity;
    items!: InstructorPaymentItemEntity[];
    total!: number;
    page!: number;
    limit!: number;
}