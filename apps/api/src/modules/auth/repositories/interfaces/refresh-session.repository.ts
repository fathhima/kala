import { RefreshSessionRecord } from "@/shared/redis/types/refresh-session.type";

export const REFRESH_SESSION_REPOSITORY = Symbol("REFRESH_SESSION_REPOSITORY",);

export interface RefreshSessionRepository {
    create(sessionId: string, userId: string, ttlSeconds: number,): Promise<void>;

    findById(sessionId: string,): Promise<RefreshSessionRecord | null>;

    revoke(sessionId: string, userId?: string,): Promise<void>;

    revokeAllForUser(userId: string): Promise<void>;
}