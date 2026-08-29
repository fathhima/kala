import { PasswordResetRecord } from "@/shared/redis/types/password-reset-record";

export const PASSWORD_RESET_REPOSITORY = Symbol("PASSWORD_RESET_REPOSITORY",);

export interface IPasswordResetRepository {
    create(tokenHash: string, userId: string, ttlSeconds: number,): Promise<void>;

    findByTokenHash(tokenHash: string,): Promise<PasswordResetRecord | null>;

    consume(tokenHash: string,): Promise<PasswordResetRecord | null>;

    revokeAllForUser(userId: string): Promise<void>;
}