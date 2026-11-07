import { INestApplication, RawBodyRequest, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { Request } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { AppModule } from '@/app.module';
import { setupSwagger } from '@/shared/config/swagger.config';
import { GlobalExceptionFilter } from '@/shared/filters/http-exception.filter';
import { RedisIoAdapter } from '@/shared/redis/redis-io.adapter';
import { RequestIdMiddleware } from '../logger/middleware/request-id.middleware';
import { LOGGER_SERVICE } from '../logger/repositories/interfaces/logger.interface';

export async function setupApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(LOGGER_SERVICE));

  const configService = app.get(ConfigService);
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  // Trust reverse proxy (ALB / CloudFront / Nginx) for accurate client IP detection & rate limiting
  const httpAdapter = app.getHttpAdapter();
  if (typeof httpAdapter.getInstance === 'function') {
    const expressApp = httpAdapter.getInstance();
    if (typeof expressApp?.set === 'function') {
      expressApp.set('trust proxy', 1);
    }
  }

  // Request ID middleware for request correlation
  app.use(new RequestIdMiddleware().use);

  app.use(
    helmet({
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
    }),
  );

  app.use(cookieParser());

  app.use(
    bodyParser.json({
      limit: '1mb',
      verify: (req: RawBodyRequest<Request>, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const origins = configService
    .getOrThrow<string>('CORS_ORIGINS')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(morgan(isProduction ? 'combined' : 'dev'));

  app.setGlobalPrefix('api', {
    exclude: ['metrics', 'health'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  // Socket.IO Redis Adapter for multi-instance horizontal scaling
  const redisUri = configService.get<string>('REDIS_URI');
  if (redisUri) {
    const redisIoAdapter = new RedisIoAdapter(app, redisUri);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
  }

  setupSwagger(app, configService);

  return app;
}
