export const KEY_VALUE_STORE = Symbol('KEY_VALUE_STORE');
export const REDIS_SERVICE = Symbol('REDIS_SERVICE');

export interface IKeyValueStore {
    get(key: string): Promise<string | null>;

    set(key: string, value: string, ttlSeconds: number): Promise<void>;

    del(...keys: string[]): Promise<void>;

    ttl(key: string): Promise<number>;

    getdel(key: string): Promise<string | null>;

    sadd(key: string, member: string, ttlSeconds?: number): Promise<void>;

    smembers(key: string): Promise<string[]>;

    srem(key: string, member: string): Promise<void>;

    expire(key: string, ttlSeconds: number): Promise<void>;

    multiSet(ops: Array<{ key: string; value: string; ttlSeconds: number }>): Promise<void>;
    
    multiDel(keys: string[]): Promise<void>;
}

export type IRedisService = IKeyValueStore;