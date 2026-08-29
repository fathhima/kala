import { Injectable } from "@nestjs/common";
import { RedisService } from "@/shared/redis/redis.service";
import { PendingSignup } from "../types/pending-signup.type";
import { IPendingSignupRepository } from "./interfaces/pending-signup.interface";

@Injectable()
export class RedisPendingSignupRepository implements IPendingSignupRepository {
    constructor(private readonly _redisService: RedisService) { }

    async save(signup: PendingSignup, ttlSeconds: number): Promise<void> {
        const client = this._redisService.getClient();

        await client
            .multi()
            .set(this._signupKey(signup.id), JSON.stringify(signup), "EX", ttlSeconds,)
            .set(this._emailIndexKey(signup.email), signup.id, "EX", ttlSeconds,)
            .exec();
    }

    async findById(id: string): Promise<PendingSignup | null> {
        const raw = await this._redisService.getClient().get(this._signupKey(id));

        return raw ? (JSON.parse(raw) as PendingSignup) : null;
    }

    async findIdByEmail(email: string): Promise<string | null> {
        return this._redisService.getClient().get(this._emailIndexKey(email));
    }

    async getTtl(id: string): Promise<number> {
        return this._redisService.getClient().ttl(this._signupKey(id));
    }

    async delete(id: string, email: string): Promise<void> {
        await this._redisService
            .getClient()
            .multi()
            .del(this._signupKey(id))
            .del(this._emailIndexKey(email))
            .exec();
    }

    private _signupKey(id: string): string {
        return `auth:signup:${id}`;
    }

    private _emailIndexKey(email: string): string {
        return `auth:signup-email:${email}`;
    }
}