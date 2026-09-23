import { Inject, Injectable } from "@nestjs/common";
import { IPasswordResetRepository } from "./interfaces/password-reset.interface";
import { PasswordResetRecord } from "../types/password-reset-record";
import { type IRedisService, REDIS_SERVICE } from "@/shared/redis/repositories/interfaces/key-value-store.interface";

@Injectable()
export class RedisPasswordResetRepository implements IPasswordResetRepository {
    constructor(@Inject(REDIS_SERVICE)
    private readonly _redisService: IRedisService) { }

    async create(tokenHash: string, userId: string, ttlSeconds: number,): Promise<void> {
        const record: PasswordResetRecord = { userId, createdAt: new Date().toISOString(), };

        await this._redisService.set(this._tokenKey(tokenHash), JSON.stringify(record), ttlSeconds);
        await this._redisService.sadd(this._userTokensKey(userId), tokenHash, ttlSeconds);
    }

    async findByTokenHash(tokenHash: string,): Promise<PasswordResetRecord | null> {
        const raw = await this._redisService.get(this._tokenKey(tokenHash),);

        return raw ? (JSON.parse(raw) as PasswordResetRecord) : null;
    }

    async consume(tokenHash: string,): Promise<PasswordResetRecord | null> {
        const raw = await this._redisService.getdel(this._tokenKey(tokenHash));
        if (!raw) return null;

        const record = JSON.parse(raw) as PasswordResetRecord;
        await this._redisService.srem(this._userTokensKey(record.userId), tokenHash);
        return record;
    }

    async revokeAllForUser(userId: string): Promise<void> {
        const hashes = await this._redisService.smembers(this._userTokensKey(userId));
        await this._redisService.del(
            ...hashes.map((hash) => this._tokenKey(hash)),
            this._userTokensKey(userId),
        );
    }

    private _tokenKey(tokenHash: string): string {
        return `auth:password-reset:${tokenHash}`;
    }

    private _userTokensKey(userId: string): string {
        return `auth:user-password-resets:${userId}`;
    }
}