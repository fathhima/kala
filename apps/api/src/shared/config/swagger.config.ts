import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_CONSTANTS = {
  TITLE: 'Kala API',
  DESCRIPTION:
    'API documentation for Kala — a live creative learning marketplace where students connect with instructors for interactive sessions.',
  VERSION: '1.0',
  DOCS_PATH: 'api/docs',
  JSON_PATH: 'api/docs-json',
  YAML_PATH: 'api/docs-yaml',
};

export function setupSwagger(app: INestApplication, configService: ConfigService): void {
  const isProd = configService.get<string>('NODE_ENV') === 'production';
  const disableSwaggerInProd = configService.get<string>('DISABLE_SWAGGER') === 'true';

  if (isProd && disableSwaggerInProd) {
    return;
  }

  const serverUrl =
    configService.get<string>('SWAGGER_SERVER_URL') ||
    (isProd ? 'https://api.kalaaa.in' : 'http://localhost:4000');

  const builder = new DocumentBuilder()
    .setTitle(SWAGGER_CONSTANTS.TITLE)
    .setDescription(SWAGGER_CONSTANTS.DESCRIPTION)
    .setVersion(SWAGGER_CONSTANTS.VERSION)
    .addServer(serverUrl, isProd ? 'Production Server' : 'Local Server')
    .setContact(
      'Fathima Sadakkathullah',
      'https://www.linkedin.com/in/fathima-sadakkathullah/',
      'fathimasadakkathullah@gmail.com',
    )
    .addBearerAuth()
    .addCookieAuth();

  const config = builder.build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(SWAGGER_CONSTANTS.DOCS_PATH, app, document);
  SwaggerModule.setup(SWAGGER_CONSTANTS.JSON_PATH, app, document, {
    ui: false,
  });
  SwaggerModule.setup(SWAGGER_CONSTANTS.YAML_PATH, app, document, {
    ui: false,
  });
}
