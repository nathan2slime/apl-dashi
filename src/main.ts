import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

import cookieParser from 'cookie-parser';

import 'reflect-metadata';

import { AppModule } from '~/app/app.module';
import { HttpExceptionFilter } from '~/app/filters/http-exception.filter';
import { AppConfig } from '~/config';

const main = async () => {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: process.env.NODE_ENV === 'production'
    })
  });

  const config = app.get<ConfigService<AppConfig>>(ConfigService);
  const logger = new Logger('Bootstrap');
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: config.get('CLIENT_URL')
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
      validateCustomDecorators: true
    })
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const docConfig = new DocumentBuilder().setTitle('API Documentation').build();

  app.setGlobalPrefix('api');

  const document = SwaggerModule.createDocument(app, docConfig);
  SwaggerModule.setup('api/docs', app, document);
  app.use(
    '/api/reference',
    apiReference({
      theme: 'bluePlanet',
      layout: 'modern',
      slug: 'apl-dashi',
      hideClientButton: true,
      title: 'Atani API Reference',
      content: document
    })
  );

  await app.listen(String(process.env.PORT), () =>
    logger.debug(`Running in http://localhost:${process.env.PORT}/api/docs`)
  );
};

main();
