import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { RefreshSessionRecord } from "./types/refresh-session.type";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis

  constructor(private readonly configService: ConfigService) {
    const redisUri = this.configService.getOrThrow<string>('REDIS_URI')
    this.client = new Redis(redisUri)
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds)
      return
    }
    await this.client.set(key, value)
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async del(key: string): Promise<number> {
    return this.client.del(key)
  }

  async setPendingSignup(id: string, value: string, ttlSeconds: number): Promise<void> {
    await this.set(`auth:signup:${id}`, value, ttlSeconds)
  }

  async getPendingSignup(id: string): Promise<string | null> {
    return this.get(`auth:signup:${id}`);
  }

  async deletePendingSignup(id: string): Promise<number> {
    return this.del(`auth:signup:${id}`);
  }

  async setPendingSignupEmailIndex(email: string, id: string, ttlSeconds: number): Promise<void> {
    await this.set(`auth:signup-email:${email}`, id, ttlSeconds);
  }

  async getPendingSignupIdByEmail(email: string): Promise<string | null> {
    return this.get(`auth:signup-email:${email}`);
  }

  async deletePendingSignupEmailIndex(email: string): Promise<number> {
    return this.del(`auth:signup-email:${email}`);
  }

  async getPendingSignupTtl(id: string): Promise<number> {
    return this.client.ttl(`auth:signup:${id}`);
  }

  async setRefreshSession(sessionId: string, userId: string, ttlSeconds: number): Promise<void> {
    const sessionKey = this.refreshSessionKey(sessionId)
    const userSessionsKey = this.userSessionsKey(userId)

    const value: RefreshSessionRecord = {
      userId,
      createdAt: new Date().toISOString()
    }

    const pipeline = this.client.multi()
    pipeline.set(sessionKey, JSON.stringify(value), 'EX', ttlSeconds)
    pipeline.sadd(userSessionsKey, sessionId)
    pipeline.expire(userSessionsKey, ttlSeconds)
    await pipeline.exec()
  }

  async getRefreshSession(sessionId: string): Promise<RefreshSessionRecord | null> {
    const raw = await this.client.get(this.refreshSessionKey(sessionId))

    if (!raw) {
      return null
    }

    return JSON.parse(raw) as RefreshSessionRecord
  }

  async deleteRefreshSession(sessionId: string, userId?: string): Promise<void> {
    const session = userId ? { userId } : await this.getRefreshSession(sessionId)

    const pipeline = this.client.multi()
    pipeline.del(this.refreshSessionKey(sessionId))

    if (session?.userId) {
      pipeline.srem(this.userSessionsKey(session.userId), sessionId)
    }

    await pipeline.exec()

  }

  async deleteAllUserRefreshSessions(userId: string): Promise<void> {
    const userSessionsKey = this.userSessionsKey(userId)
    const sessionIds = await this.client.smembers(userSessionsKey)

    const pipeline = this.client.multi()

    for (const sessionId of sessionIds) {
      pipeline.del(this.refreshSessionKey(sessionId))
    }

    pipeline.del(userSessionsKey)
    await pipeline.exec()
  }

  async onModuleDestroy() {
    await this.client.quit()
  }

  private refreshSessionKey(sessionId: string) {
    return `auth:refresh:${sessionId}`
  }

  private userSessionsKey(userId: string) {
    return `auth:user-sessions:${userId}`
  }
}