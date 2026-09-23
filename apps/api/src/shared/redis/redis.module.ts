import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { KEY_VALUE_STORE, REDIS_SERVICE } from './repositories/interfaces/key-value-store.interface';
import { IoRedisKeyValueStore } from './repositories/ioredis-key-value.repository';

@Global()
@Module({
  providers: [
    IoRedisKeyValueStore,
    { provide: KEY_VALUE_STORE, useExisting: IoRedisKeyValueStore },
    { provide: REDIS_SERVICE, useClass: RedisService },
  ],
  exports: [REDIS_SERVICE],
})
export class RedisModule {}