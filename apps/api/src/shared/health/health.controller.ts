import { Controller, Get, HttpStatus, Inject, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '@/shared/decorators/public.decorator';
import { PrismaService } from '@/shared/prisma/prisma.service';
import {
  type IRedisService,
  REDIS_SERVICE,
} from '@/shared/redis/repositories/interfaces/key-value-store.interface';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly _prisma: PrismaService,
    @Inject(REDIS_SERVICE)
    private readonly _redis: IRedisService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check endpoint for ALB and monitoring' })
  @ApiResponse({ status: 200, description: 'All services are healthy' })
  @ApiResponse({ status: 503, description: 'One or more services are unavailable' })
  async check(@Res({ passthrough: true }) res: Response) {
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();

    const [dbHealthy, redisHealthy] = await Promise.all([
      this._checkDatabase(),
      this._checkRedis(),
    ]);

    const isHealthy = dbHealthy && redisHealthy;

    if (!isHealthy) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
      return {
        status: 'error',
        timestamp,
        uptime,
        services: {
          database: dbHealthy ? 'up' : 'down',
          redis: redisHealthy ? 'up' : 'down',
        },
      };
    }

    res.status(HttpStatus.OK);
    return {
      status: 'ok',
      timestamp,
      uptime,
      services: {
        database: 'up',
        redis: 'up',
      },
    };
  }

  private async _checkDatabase(): Promise<boolean> {
    let timer: NodeJS.Timeout | null = null;
    try {
      await Promise.race([
        this._prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('Database timeout')), 3000);
        }),
      ]);
      return true;
    } catch {
      return false;
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  private async _checkRedis(): Promise<boolean> {
    let timer: NodeJS.Timeout | null = null;
    try {
      const pong = await Promise.race([
        this._redis.ping(),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error('Redis timeout')), 3000);
        }),
      ]);
      return pong === 'PONG';
    } catch {
      return false;
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }
}
