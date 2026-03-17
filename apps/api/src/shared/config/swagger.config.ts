import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_CONSTANTS = {
  TITLE: 'Kala API',
  DESCRIPTION: 'API documentation for Kala — a live creative learning marketplace where students connect with instructors for interactive sessions.',
  VERSION: '1.0',
  DOCS_PATH: 'api/docs',
  JSON_PATH: 'api/docs-json',
  YAML_PATH: 'api/docs-yaml',
};

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle(SWAGGER_CONSTANTS.TITLE)
    .setDescription(SWAGGER_CONSTANTS.DESCRIPTION)
    .setVersion(SWAGGER_CONSTANTS.VERSION)
    .addServer('http://localhost:4000', 'Local Server')
    .setContact(
      'Fathima Sadakkathullah',
      'https://www.linkedin.com/in/fathima-sadakkathullah/',
      'fathimasadakkathullah@gmail.com',
    )
    .addBearerAuth()
    .addCookieAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(SWAGGER_CONSTANTS.DOCS_PATH, app, document);
  SwaggerModule.setup(SWAGGER_CONSTANTS.JSON_PATH, app, document, {
    ui: false,
  });
  SwaggerModule.setup(SWAGGER_CONSTANTS.YAML_PATH, app, document, {
    ui: false,
  });
}
