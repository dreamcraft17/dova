import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

function corsOrigins(): string | string[] | boolean {
  const raw = process.env.FRONTEND_URL ?? 'http://localhost:3002';
  const origins = raw.split(',').map((value) => value.trim()).filter(Boolean);
  if (origins.length === 0) return 'http://localhost:3002';
  if (origins.length === 1) return origins[0];
  return origins;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.enableCors({ origin: corsOrigins(), credentials: true });
  await app.listen(Number(process.env.PORT ?? 3000));
}
bootstrap();
