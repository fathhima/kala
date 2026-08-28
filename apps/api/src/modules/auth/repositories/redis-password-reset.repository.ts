import { Injectable } from "@nestjs/common";
import { RedisService } from "@/shared/redis/redis.service";
import { PasswordResetRecord } from "@/shared/redis/types/password-reset-record";
import { IPasswordResetRepository } from "./interfaces/password-reset.interface";

@Injectable()
export class RedisPasswordResetRepository implements IPasswordResetRepository {
    constructor(private readonly _redisService: RedisService) { }

    async create(tokenHash: string, userId: string, ttlSeconds: number,): Promise<void> {
        const client = this._redisService.getClient();

        const record: PasswordResetRecord = { userId, createdAt: new Date().toISOString(), };

        await client
            .multi()
            .set(this._tokenKey(tokenHash), JSON.stringify(record), "EX", ttlSeconds,)
            .sadd(this._userTokensKey(userId), tokenHash)
            .expire(this._userTokensKey(userId), ttlSeconds)
            .exec();
    }

    async findByTokenHash(tokenHash: string,): Promise<PasswordResetRecord | null> {
        const raw = await this._redisService.getClient().get(this._tokenKey(tokenHash),);

        return raw ? (JSON.parse(raw) as PasswordResetRecord) : null;
    }

    async consume(tokenHash: string,): Promise<PasswordResetRecord | null> {
        const client = this._redisService.getClient();

        const raw = (await client.call("GETDEL", this._tokenKey(tokenHash),)) as string | null;

        if (!raw) {
            return null;
        }

        const record = JSON.parse(raw) as PasswordResetRecord;

        await client.srem(this._userTokensKey(record.userId), tokenHash);

        return record;
    }

    async revokeAllForUser(userId: string): Promise<void> {
        const client = this._redisService.getClient();
        const tokensKey = this._userTokensKey(userId);
        const tokenHashes = await client.smembers(tokensKey);

        const transaction = client.multi();

        for (const tokenHash of tokenHashes) {
            transaction.del(this._tokenKey(tokenHash));
        }

        transaction.del(tokensKey);

        await transaction.exec();
    }

    private _tokenKey(tokenHash: string): string {
        return `auth:password-reset:${tokenHash}`;
    }

    private _userTokensKey(userId: string): string {
        return `auth:user-password-resets:${userId}`;
    }
}