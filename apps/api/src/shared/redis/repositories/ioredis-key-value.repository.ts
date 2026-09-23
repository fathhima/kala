import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { IKeyValueStore } from './interfaces/key-value-store.interface';

@Injectable()
export class IoRedisKeyValueStore implements IKeyValueStore, OnModuleDestroy {
    private readonly _client: Redis;

    constructor(private readonly _configService: ConfigService) {
        this._client = new Redis(this._configService.getOrThrow<string>('REDIS_URI'));
    }

    get(key: string) {
        return this._client.get(key);
    }

    async set(key: string, value: string, ttlSeconds: number) {
        await this._client.set(key, value, 'EX', ttlSeconds);
    }

    async del(...keys: string[]) {
        if (keys.length) await this._client.del(...keys);
    }

    ttl(key: string) {
        return this._client.ttl(key);
    }

    async getdel(key: string) {
        const value = (await this._client.call('GETDEL', key)) as string | null;
        return value ?? null;
    }

    async sadd(key: string, member: string, ttlSeconds?: number) {
        const pipeline = this._client.multi().sadd(key, member);
        if (ttlSeconds !== undefined) pipeline.expire(key, ttlSeconds);
        await pipeline.exec();
    }

    smembers(key: string) {
        return this._client.smembers(key);
    }

    async srem(key: string, member: string) {
        await this._client.srem(key, member);
    }

    async expire(key: string, ttlSeconds: number) {
        await this._client.expire(key, ttlSeconds);
    }

    async multiSet(ops: Array<{ key: string; value: string; ttlSeconds: number }>) {
        const pipeline = this._client.multi();
        for (const op of ops) pipeline.set(op.key, op.value, 'EX', op.ttlSeconds);
        await pipeline.exec();
    }

    async multiDel(keys: string[]) {
        if (!keys.length) return;
        const pipeline = this._client.multi();
        for (const key of keys) pipeline.del(key);
        await pipeline.exec();
    }

    async onModuleDestroy() {
        await this._client.quit();
    }
}