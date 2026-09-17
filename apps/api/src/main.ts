import { ConfigService } from '@nestjs/config';
import { setupApp } from '@/shared/config/app.config';
import { LOGGER_SERVICE } from './shared/logger/repositories/interfaces/logger.interface';

async function bootstrap() {
  const app = await setupApp();

  const configService = app.get(ConfigService);
  const loggerService = app.get(LOGGER_SERVICE);
  const port = configService.getOrThrow<number>('PORT');

  await app.listen(port);
  loggerService.log(`Server started listening on ${port}`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Error during application bootstrap:', message);
  process.exit(1);
});
