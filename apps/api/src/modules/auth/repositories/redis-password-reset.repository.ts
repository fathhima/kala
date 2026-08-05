import { Injectable } from "@nestjs/common";
import { RedisService } from "@/shared/redis/redis.service";
import { PasswordResetRecord } from "@/shared/redis/types/password-reset-record";
import { PasswordResetRepository } from "./interfaces/password-reset.repository";

@Injectable()
export class RedisPasswordResetRepository implements PasswordResetRepository {
    constructor(private readonly redisService: RedisService) { }

    async create(tokenHash: string, userId: string, ttlSeconds: number,): Promise<void> {
        const client = this.redisService.getClient();

        const record: PasswordResetRecord = { userId, createdAt: new Date().toISOString(), };

        await client
            .multi()
            .set(this.tokenKey(tokenHash), JSON.stringify(record), "EX", ttlSeconds,)
            .sadd(this.userTokensKey(userId), tokenHash)
            .expire(this.userTokensKey(userId), ttlSeconds)
            .exec();
    }

    async findByTokenHash(tokenHash: string,): Promise<PasswordResetRecord | null> {
        const raw = await this.redisService.getClient().get(this.tokenKey(tokenHash),);

        return raw ? (JSON.parse(raw) as PasswordResetRecord) : null;
    }

    async consume(tokenHash: string,): Promise<PasswordResetRecord | null> {
        const client = this.redisService.getClient();

        // Atomic: only one request can retrieve this token.
        const raw = (await client.call("GETDEL", this.tokenKey(tokenHash),)) as string | null;

        if (!raw) {
            return null;
        }

        const record = JSON.parse(raw) as PasswordResetRecord;

        await client.srem(this.userTokensKey(record.userId), tokenHash);

        return record;
    }

    async revokeAllForUser(userId: string): Promise<void> {
        const client = this.redisService.getClient();
        const tokensKey = this.userTokensKey(userId);
        const tokenHashes = await client.smembers(tokensKey);

        const transaction = client.multi();

        for (const tokenHash of tokenHashes) {
            transaction.del(this.tokenKey(tokenHash));
        }

        transaction.del(tokensKey);

        await transaction.exec();
    }

    private tokenKey(tokenHash: string): string {
        return `auth:password-reset:${tokenHash}`;
    }

    private userTokensKey(userId: string): string {
        return `auth:user-password-resets:${userId}`;
    }
}