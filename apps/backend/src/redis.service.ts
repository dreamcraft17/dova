import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private active = Boolean(process.env.REDIS_URL) && process.env.USE_IN_MEMORY !== 'true';
  private client?: RedisClientType;

  constructor() {
    if (this.active) this.client = createClient({ url: process.env.REDIS_URL });
  }

  get enabled() {
    return this.active && Boolean(this.client?.isOpen);
  }

  async onModuleInit() {
    if (!this.client || this.client.isOpen) return;
    try {
      await this.client.connect();
    } catch (error) {
      console.warn('[Redis] unavailable — continuing without cache:', (error as Error).message);
      this.active = false;
      this.client = undefined;
    }
  }

  async onModuleDestroy() {
    if (this.client?.isOpen) await this.client.quit();
  }

  async set(key: string, value: string, ttlSeconds: number) {
    if (this.client?.isOpen) await this.client.set(key, value, { EX: ttlSeconds });
  }

  async get(key: string) {
    return this.client?.isOpen ? this.client.get(key) : null;
  }

  async del(key: string) {
    if (this.client?.isOpen) await this.client.del(key);
  }
}
