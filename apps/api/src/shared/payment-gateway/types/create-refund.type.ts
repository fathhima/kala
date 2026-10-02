export type CreateRefundInput = {
    gatewayPaymentIntentId: string;
    amount?: number;
    reason?: string;
};