import { Injectable } from "@nestjs/common";
import { RedisService } from "@/shared/redis/redis.service";
import { RefreshSessionRecord } from "@/shared/redis/types/refresh-session.type";
import { IRefreshSessionRepository } from "./interfaces/refresh-session.interface";

@Injectable()
export class RedisRefreshSessionRepository implements IRefreshSessionRepository {
    constructor(private readonly _redisService: RedisService) { }

    async create(sessionId: string, userId: string, ttlSeconds: number,): Promise<void> {
        const client = this._redisService.getClient();

        const session: RefreshSessionRecord = { userId, createdAt: new Date().toISOString(), };

        await client.multi().set(this._sessionKey(sessionId), JSON.stringify(session), "EX", ttlSeconds,)
            .sadd(this._userSessionsKey(userId), sessionId)
            .expire(this._userSessionsKey(userId), ttlSeconds)
            .exec();
    }

    async findById(sessionId: string,): Promise<RefreshSessionRecord | null> {
        const raw = await this._redisService.getClient().get(this._sessionKey(sessionId),);

        return raw ? (JSON.parse(raw) as RefreshSessionRecord) : null;
    }

    async revoke(sessionId: string, userId?: string): Promise<void> {
        const session = userId ? { userId } : await this.findById(sessionId);

        const transaction = this._redisService.getClient().multi().del(this._sessionKey(sessionId));

        if (session?.userId) {
            transaction.srem(this._userSessionsKey(session.userId), sessionId);
        }

        await transaction.exec();
    }

    async revokeAllForUser(userId: string): Promise<void> {
        const client = this._redisService.getClient();
        const userSessionsKey = this._userSessionsKey(userId);

        const sessionIds = await client.smembers(userSessionsKey);
        const transaction = client.multi();

        for (const sessionId of sessionIds) {
            transaction.del(this._sessionKey(sessionId));
        }

        transaction.del(userSessionsKey);

        await transaction.exec();
    }

    private _sessionKey(sessionId: string): string {
        return `auth:refresh:${sessionId}`;
    }

    private _userSessionsKey(userId: string): string {
        return `auth:user-sessions:${userId}`;
    }
}