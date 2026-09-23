import { Inject, Injectable } from '@nestjs/common';
import { IRedisService, KEY_VALUE_STORE, type IKeyValueStore, } from './repositories/interfaces/key-value-store.interface';

@Injectable()
export class RedisService implements IRedisService {
  constructor(
    @Inject(KEY_VALUE_STORE)
    private readonly _store: IKeyValueStore,
  ) { }

  get(key: string) { return this._store.get(key); }

  set(key: string, value: string, ttlSeconds: number) { return this._store.set(key, value, ttlSeconds); }

  del(...keys: string[]) { return this._store.del(...keys); }

  ttl(key: string) { return this._store.ttl(key); }

  getdel(key: string) { return this._store.getdel(key); }

  sadd(key: string, member: string, ttlSeconds?: number) { return this._store.sadd(key, member, ttlSeconds); }

  smembers(key: string) { return this._store.smembers(key); }

  srem(key: string, member: string) { return this._store.srem(key, member); }

  expire(key: string, ttlSeconds: number) { return this._store.expire(key, ttlSeconds); }

  multiSet(ops: Array<{ key: string; value: string; ttlSeconds: number }>) { return this._store.multiSet(ops); }

  multiDel(keys: string[]) { return this._store.multiDel(keys); }
}