import 'reflect-metadata';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { loadBackendEnv } from './load-env';
loadBackendEnv();
import { assertProductionSecrets } from './env-guard';
assertProductionSecrets();
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

function corsOrigins(): string | string[] | boolean {
  const raw = process.env.CORS_ORIGINS ?? process.env.FRONTEND_URL ?? 'http://localhost:3002';
  const origins = raw.split(',').map((value) => value.trim()).filter(Boolean);
  if (origins.length === 0) return 'http://localhost:3002';
  if (origins.length === 1) return origins[0];
  return origins;
}

async function bootstrap() {
  const uploadRoot = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
  if (!existsSync(uploadRoot)) mkdirSync(uploadRoot, { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  app.useStaticAssets(uploadRoot, { prefix: '/uploads/', index: false, dotfiles: 'deny' });
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.enableCors({
    origin: corsOrigins(),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-paystack-signature'],
  });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`DOVA API listening on :${port} | CORS: ${process.env.FRONTEND_URL ?? 'default localhost'} | uploads: ${uploadRoot}`);
}
bootstrap();
