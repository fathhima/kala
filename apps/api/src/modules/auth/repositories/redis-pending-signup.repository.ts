import { Injectable } from "@nestjs/common";
import { RedisService } from "@/shared/redis/redis.service";
import { PendingSignup } from "../types/pending-signup.type";
import { PendingSignupRepository } from "./interfaces/pending-signup.repository";

@Injectable()
export class RedisPendingSignupRepository implements PendingSignupRepository {
    constructor(private readonly redisService: RedisService) { }

    async save(signup: PendingSignup, ttlSeconds: number): Promise<void> {
        const client = this.redisService.getClient();

        await client
            .multi()
            .set(this.signupKey(signup.id), JSON.stringify(signup), "EX", ttlSeconds,)
            .set(this.emailIndexKey(signup.email), signup.id, "EX", ttlSeconds,)
            .exec();
    }

    async findById(id: string): Promise<PendingSignup | null> {
        const raw = await this.redisService.getClient().get(this.signupKey(id));

        return raw ? (JSON.parse(raw) as PendingSignup) : null;
    }

    async findIdByEmail(email: string): Promise<string | null> {
        return this.redisService.getClient().get(this.emailIndexKey(email));
    }

    async getTtl(id: string): Promise<number> {
        return this.redisService.getClient().ttl(this.signupKey(id));
    }

    async delete(id: string, email: string): Promise<void> {
        await this.redisService
            .getClient()
            .multi()
            .del(this.signupKey(id))
            .del(this.emailIndexKey(email))
            .exec();
    }

    private signupKey(id: string): string {
        return `auth:signup:${id}`;
    }

    private emailIndexKey(email: string): string {
        return `auth:signup-email:${email}`;
    }
}