import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly _client: Redis

  constructor(private readonly _configService: ConfigService) {
    const redisUri = this._configService.getOrThrow<string>('REDIS_URI')
    this._client = new Redis(redisUri)
  }

  getClient(): Redis {
    return this._client;
  }

  async onModuleDestroy() {
    await this._client.quit()
  }

}