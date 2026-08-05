import { Injectable } from "@nestjs/common";
import { RedisService } from "@/shared/redis/redis.service";
import { RefreshSessionRecord } from "@/shared/redis/types/refresh-session.type";
import { RefreshSessionRepository } from "./interfaces/refresh-session.repository";

@Injectable()
export class RedisRefreshSessionRepository implements RefreshSessionRepository {
    constructor(private readonly redisService: RedisService) { }

    async create(sessionId: string, userId: string, ttlSeconds: number,): Promise<void> {
        const client = this.redisService.getClient();

        const session: RefreshSessionRecord = { userId, createdAt: new Date().toISOString(), };

        await client.multi().set(this.sessionKey(sessionId), JSON.stringify(session), "EX", ttlSeconds,)
            .sadd(this.userSessionsKey(userId), sessionId)
            .expire(this.userSessionsKey(userId), ttlSeconds)
            .exec();
    }

    async findById(sessionId: string,): Promise<RefreshSessionRecord | null> {
        const raw = await this.redisService.getClient().get(this.sessionKey(sessionId),);

        return raw ? (JSON.parse(raw) as RefreshSessionRecord) : null;
    }

    async revoke(sessionId: string, userId?: string): Promise<void> {
        const session = userId ? { userId } : await this.findById(sessionId);

        const transaction = this.redisService.getClient().multi().del(this.sessionKey(sessionId));

        if (session?.userId) {
            transaction.srem(this.userSessionsKey(session.userId), sessionId);
        }

        await transaction.exec();
    }

    async revokeAllForUser(userId: string): Promise<void> {
        const client = this.redisService.getClient();
        const userSessionsKey = this.userSessionsKey(userId);

        const sessionIds = await client.smembers(userSessionsKey);
        const transaction = client.multi();

        for (const sessionId of sessionIds) {
            transaction.del(this.sessionKey(sessionId));
        }

        transaction.del(userSessionsKey);

        await transaction.exec();
    }

    private sessionKey(sessionId: string): string {
        return `auth:refresh:${sessionId}`;
    }

    private userSessionsKey(userId: string): string {
        return `auth:user-sessions:${userId}`;
    }
}