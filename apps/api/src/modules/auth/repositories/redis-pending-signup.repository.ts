import { Inject, Injectable } from "@nestjs/common";
import { PendingSignup } from "../types/pending-signup.type";
import { IPendingSignupRepository } from "./interfaces/pending-signup.interface";
import { type IRedisService, REDIS_SERVICE } from "@/shared/redis/repositories/interfaces/key-value-store.interface";

@Injectable()
export class RedisPendingSignupRepository implements IPendingSignupRepository {
    constructor(@Inject(REDIS_SERVICE)
    private readonly _redisService: IRedisService) { }

    async save(signup: PendingSignup, ttlSeconds: number): Promise<void> {
        await this._redisService.multiSet([
            { key: this._signupKey(signup.id), value: JSON.stringify(signup), ttlSeconds },
            { key: this._emailIndexKey(signup.email), value: signup.id, ttlSeconds },
        ]);
    }

    async findById(id: string): Promise<PendingSignup | null> {
        const raw = await this._redisService.get(this._signupKey(id));

        return raw ? (JSON.parse(raw) as PendingSignup) : null;
    }

    async findIdByEmail(email: string): Promise<string | null> {
        return this._redisService.get(this._emailIndexKey(email));
    }

    // remaining ttl seconds
    async getTtl(id: string): Promise<number> {
        return this._redisService.ttl(this._signupKey(id));
    }

    async delete(id: string, email: string): Promise<void> {
        await this._redisService.multiDel([this._signupKey(id), this._emailIndexKey(email)]);
    }

    private _signupKey(id: string): string {
        return `auth:signup:${id}`;
    }

    private _emailIndexKey(email: string): string {
        return `auth:signup-email:${email}`;
    }
}