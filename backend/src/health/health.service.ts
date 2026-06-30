import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';

type HealthStatus = 'ok' | 'error';

export type HealthCheckResult = {
  status: HealthStatus;
  database: HealthStatus;
  redis: HealthStatus;
  environment: string;
  uptime: number;
};

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly config: ConfigService,
  ) {}

  async check(): Promise<HealthCheckResult> {
    const [database, redis] = await Promise.allSettled([
      this.withTimeout(this.prisma.$queryRaw`SELECT 1`, 2500),
      this.withTimeout(this.cache.ping(), 2500),
    ]);

    const databaseStatus = database.status === 'fulfilled' ? 'ok' : 'error';
    const redisStatus = redis.status === 'fulfilled' ? 'ok' : 'error';

    return {
      status: databaseStatus === 'ok' && redisStatus === 'ok' ? 'ok' : 'error',
      database: databaseStatus,
      redis: redisStatus,
      environment: this.config.get<string>('app.nodeEnv') ?? 'unknown',
      uptime: Math.round(process.uptime()),
    };
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Health check timeout.')), timeoutMs);
      promise
        .then((result) => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch((error: unknown) => {
          clearTimeout(timeout);
          reject(error instanceof Error ? error : new Error('Health check failed.'));
        });
    });
  }
}
