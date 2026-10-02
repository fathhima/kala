export class PaymentNotFoundError extends Error {
    override name = 'PaymentNotFoundError';
    constructor(message = 'Payment not found') { super(message); }
}

export class PaymentConflictError extends Error {
    override name = 'PaymentConflictError';
    constructor(message: string) { super(message); }
}

export class PaymentValidationError extends Error {
    override name = 'PaymentValidationError';
    constructor(message: string) { super(message); }
}

export class PaymentGatewayError extends Error {
    override name = 'PaymentGatewayError';
    constructor(message: string) { super(message); }
}
