// shared/errors/unique-constraint.error.ts
export class UniqueConstraintError extends Error {
    constructor(readonly target: string[] = []) {
        super('Unique constraint violated');
        this.name = 'UniqueConstraintError';
    }
}