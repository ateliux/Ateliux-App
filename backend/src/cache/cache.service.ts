import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(config: ConfigService) {
    this.redis = new Redis({
      host: config.getOrThrow<string>('redis.host'),
      port: config.getOrThrow<number>('redis.port'),
      password: config.get<string>('redis.password') || undefined,
      maxRetriesPerRequest: 3,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const raw = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.set(key, raw, 'EX', ttlSeconds);
      return;
    }

    await this.redis.set(key, raw);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async remember<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const value = await loader();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
