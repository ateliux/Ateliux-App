import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  const apiPrefix = config.getOrThrow<string>('app.apiPrefix');
  const corsOrigins = config.getOrThrow<string[]>('app.corsOrigins');

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  app.use(helmet());
  app.use(cookieParser(config.getOrThrow<string>('auth.cookieSecret')));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new RequestLoggingInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ateliux API')
    .setDescription('API central da Ateliux para frontend, admin e Portal do Cliente')
    .setVersion('0.1.0')
    .addBearerAuth()
    .addCookieAuth('ateliux_admin_access_token')
    .addCookieAuth('ateliux_client_access_token')
    .addTag('Auth Client')
    .addTag('Auth Admin')
    .addTag('Clients')
    .addTag('Projects')
    .addTag('Portal')
    .addTag('Blog')
    .addTag('Newsletter')
    .addTag('Contact')
    .addTag('Inbox')
    .addTag('Uploads')
    .addTag('Notifications')
    .addTag('Audit Logs')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = config.getOrThrow<number>('app.port');
  await app.listen(port);
  logger.log(`Ateliux API running on http://localhost:${port}/${apiPrefix}`);
  logger.log(`Swagger available on http://localhost:${port}/${apiPrefix}/docs`);
}

void bootstrap();
