export type WebhookEvent = {
    type: string;
    gatewaySessionId: string;
    gatewayPaymentIntentId: string;
    amount: number;
    currency: string;
    metadata: Record<string, string>;
};