import { PaymentStatus } from '../enums/payment.enum';

export type CreatePaymentInput = {
    bookingId: string;
    studentId: string;
    amount: number;
    currency: string;
};

export type ConfirmPaymentInput = {
    gatewaySessionId: string;
    gatewayPaymentIntentId: string;
};

export type PaymentListQuery = {
    status?: PaymentStatus;
    from?: Date;
    to?: Date;
    page: number;
    limit: number;
};