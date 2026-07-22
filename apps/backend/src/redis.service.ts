import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  readonly enabled = Boolean(process.env.REDIS_URL) && process.env.USE_IN_MEMORY !== 'true';
  readonly client?: RedisClientType;
  constructor() { if (this.enabled) this.client = createClient({ url: process.env.REDIS_URL }); }
  async onModuleInit() { if (this.client && !this.client.isOpen) await this.client.connect(); }
  async onModuleDestroy() { if (this.client?.isOpen) await this.client.quit(); }
  async set(key: string, value: string, ttlSeconds: number) { if (this.client) await this.client.set(key, value, { EX: ttlSeconds }); }
  async get(key: string) { return this.client ? this.client.get(key) : null; }
  async del(key: string) { if (this.client) await this.client.del(key); }
}
