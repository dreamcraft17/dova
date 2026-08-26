import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database.service';
import { RedisService } from './redis.service';
import { NotificationService } from './notification.service';
import { FeedbackService } from './feedback.service';
import { PaystackService } from './paystack.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET ?? 'change-me-in-development', signOptions: { expiresIn: '15m' } }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 100 },
      { name: 'auth', ttl: 60_000, limit: 10 },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DatabaseService,
    RedisService,
    NotificationService,
    FeedbackService,
    PaystackService,
    JwtAuthGuard,
    RolesGuard,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
