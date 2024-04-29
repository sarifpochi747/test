import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { session } from 'src/auth/session'
import * as passport from "passport"
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './filter/http-exception.filter';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(session);
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin: process.env.MODE === "DEV" ? [
      /^http:\/\/localhost($|:\d+$)/,
      /^http:\/\/192\.168\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)($|:\d+$)/,
    ] : [process.env.ORIGIN, process.env.PYTHON_HOST],
    methods: ['PUT', 'POST', 'PATCH', 'GET', 'DELETE'],
    credentials: true
  });
  if (process.env.MODE === "DEV") {
    const config = new DocumentBuilder()
      .setTitle('Facetrack - api document')
      .setDescription('Facetrack api')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }
  app.useBodyParser('json', { limit: '500mb' });
  app.use(passport.initialize());
  app.use(passport.session());
  await app.listen(process.env.PORT);
}
bootstrap();
