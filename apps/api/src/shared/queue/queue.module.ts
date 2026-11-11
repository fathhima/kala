import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUri = configService.getOrThrow<string>('REDIS_URI');
        const url = new URL(redisUri);
        const useTls = url.protocol === 'rediss:';
        return {
          connection: {
            host: url.hostname || 'localhost',
            port: url.port ? parseInt(url.port, 10) : 6379,
            password: url.password || undefined,
            username: url.username || undefined,
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            ...(useTls && { tls: {} }),
          },
        };
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
