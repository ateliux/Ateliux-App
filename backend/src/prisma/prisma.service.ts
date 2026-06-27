import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  handleKnownError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        code: error.code,
        message: error.message,
        meta: error.meta,
      };
    }

    return null;
  }
}
