import { INestApplication, RawBodyRequest, ValidationPipe, } from '@nestjs/common';
import morgan from 'morgan';
import { Request } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '@/app.module';
import { setupSwagger } from '@/shared/config/swagger.config';
import { GlobalExceptionFilter } from '@/shared/filters/http-exception.filter';
import helmet from 'helmet';
import { LOGGER_SERVICE } from '../logger/repositories/interfaces/logger.interface';
import { RequestIdMiddleware } from '../logger/middleware/request-id.middleware';

export async function setupApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(LOGGER_SERVICE))

  // Request ID middleware for request correlation
  app.use(new RequestIdMiddleware().use);

  const configService = app.get(ConfigService);

  app.use(helmet({
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    }
  }))

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

  const origins = configService.getOrThrow<string>('CORS_ORIGINS').split(',').map((origin) => origin.trim());

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(morgan('dev'));

  app.setGlobalPrefix('api', {
    exclude: ['metrics'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  setupSwagger(app);

  return app;
}
