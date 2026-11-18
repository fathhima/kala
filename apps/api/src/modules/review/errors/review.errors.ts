export class ReviewNotFoundError extends Error {
    override name = 'ReviewNotFoundError';
    constructor(message = 'Review not found') {
        super(message);
    }
}

export class ReviewConflictError extends Error {
    override name = 'ReviewConflictError';
    constructor(message = 'A review has already been submitted for this booking') {
        super(message);
    }
}

export class ReviewValidationError extends Error {
    override name = 'ReviewValidationError';
    constructor(message: string) {
        super(message);
    }
}
