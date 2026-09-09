import { ConfigService } from '@nestjs/config';
import { setupApp } from '@/shared/config/app.config';
import { LoggerService } from './shared/logger/logger.service';

async function bootstrap() {
  const app = await setupApp();

  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);
  const port = configService.getOrThrow<number>('PORT');

  await app.listen(port);
  loggerService.log(`Server started listening on ${port}`, 'Bootstrap')
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Error during application bootstrap:', message);
  process.exit(1);
});
