export type WebhookEvent = {
    type: string;
    gatewaySessionId: string;
    gatewayPaymentIntentId: string;
    gatewayRefundId?: string;       
    amount: number;
    currency: string;
    metadata: Record<string, string>;
    failureReason?: string;          
};