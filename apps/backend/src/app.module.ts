import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database.service';
import { RedisService } from './redis.service';

@Module({ imports: [JwtModule.register({ secret: process.env.JWT_SECRET ?? 'change-me-in-development', signOptions: { expiresIn: '15m' } })], controllers: [AppController], providers: [AppService, DatabaseService, RedisService] })
export class AppModule {}
