import { Inject, Injectable } from "@nestjs/common";
import { IRefreshSessionRepository } from "./interfaces/refresh-session.interface";
import { RefreshSessionRecord } from "../types/refresh-session.type";
import { type IRedisService, REDIS_SERVICE } from "@/shared/redis/repositories/interfaces/key-value-store.interface";

@Injectable()
export class RedisRefreshSessionRepository implements IRefreshSessionRepository {
    constructor(@Inject(REDIS_SERVICE)
    private readonly _redisService: IRedisService) { }

    async create(sessionId: string, userId: string, ttlSeconds: number,): Promise<void> {
        const session: RefreshSessionRecord = { userId, createdAt: new Date().toISOString(), };

        await this._redisService.set(this._sessionKey(sessionId), JSON.stringify(session), ttlSeconds);
        await this._redisService.sadd(this._userSessionsKey(userId), sessionId, ttlSeconds);
    }

    async findById(sessionId: string,): Promise<RefreshSessionRecord | null> {
        const raw = await this._redisService.get(this._sessionKey(sessionId),);

        return raw ? (JSON.parse(raw) as RefreshSessionRecord) : null;
    }

    async revoke(sessionId: string, userId?: string): Promise<void> {
        let ownerId = userId;

        if (!ownerId) {
            const session = await this.findById(sessionId);
            ownerId = session?.userId;
        }

        await this._redisService.del(this._sessionKey(sessionId));

        if (ownerId) {
            await this._redisService.srem(this._userSessionsKey(ownerId), sessionId);
        }
    }

    async revokeAllForUser(userId: string): Promise<void> {
        const sessionIds = await this._redisService.smembers(this._userSessionsKey(userId));
        await this._redisService.del(
            ...sessionIds.map((id) => this._sessionKey(id)),
            this._userSessionsKey(userId),
        );
    }

    private _sessionKey(sessionId: string): string {
        return `auth:refresh:${sessionId}`;
    }

    private _userSessionsKey(userId: string): string {
        return `auth:user-sessions:${userId}`;
    }
}