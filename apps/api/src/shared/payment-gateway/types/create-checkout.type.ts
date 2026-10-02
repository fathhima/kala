export type CreateCheckoutInput = {
    amount: number;
    currency: string;
    bookingId: string;
    customerEmail: string;
    description: string;
};