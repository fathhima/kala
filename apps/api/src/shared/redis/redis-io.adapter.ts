import { Logger } from '@nestjs/common';
import type { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import type { ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  private readonly _logger = new Logger(RedisIoAdapter.name);
  private adapterConstructor?: ReturnType<typeof createAdapter>;

  constructor(
    app: INestApplicationContext,
    private readonly _redisUri: string,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    try {
      const pubClient = new Redis(this._redisUri, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
      });
      const subClient = pubClient.duplicate();

      await Promise.all([
        new Promise<void>((resolve, reject) => {
          pubClient.once('ready', () => resolve());
          pubClient.once('error', (err) => reject(err));
        }),
        new Promise<void>((resolve, reject) => {
          subClient.once('ready', () => resolve());
          subClient.once('error', (err) => reject(err));
        }),
      ]);

      this.adapterConstructor = createAdapter(pubClient, subClient);
      this._logger.log('Socket.IO Redis adapter connected and initialized');
    } catch (error) {
      this._logger.warn(
        `Failed to connect Socket.IO Redis adapter: ${error instanceof Error ? error.message : String(error)}. Falling back to in-memory adapter.`,
      );
    }
  }

  override createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}

