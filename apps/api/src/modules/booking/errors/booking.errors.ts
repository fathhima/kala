export class SlotNotFoundError extends Error {
    override name = 'SlotNotFoundError';
    constructor(message = 'Slot not found') { super(message); }
}

export class BookingNotFoundError extends Error {
    override name = 'BookingNotFoundError';
    constructor(message = 'Booking not found') { super(message); }
}

export class BookingConflictError extends Error {
    override name = 'BookingConflictError';
    constructor(message: string) { super(message); }
}

export class BookingValidationError extends Error {
    override name = 'BookingValidationError';
    constructor(message: string) { super(message); }
}