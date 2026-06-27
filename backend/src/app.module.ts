import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { appConfig } from './config/app.config';
import { authConfig } from './config/auth.config';
import { cloudinaryConfig } from './config/cloudinary.config';
import { databaseConfig } from './config/database.config';
import { validateEnv } from './config/env.schema';
import { mailConfig } from './config/mail.config';
import { queueConfig } from './config/queue.config';
import { redisConfig } from './config/redis.config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { ClientsModule } from './clients/clients.module';
import { ClientAccountsModule } from './client-accounts/client-accounts.module';
import { ProjectsModule } from './projects/projects.module';
import { ProjectStagesModule } from './project-stages/project-stages.module';
import { BriefingsModule } from './briefings/briefings.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { PreviewsModule } from './previews/previews.module';
import { ClientRequestsModule } from './client-requests/client-requests.module';
import { InboxModule } from './inbox/inbox.module';
import { SupportModule } from './support/support.module';
import { FilesModule } from './files/files.module';
import { UploadsModule } from './uploads/uploads.module';
import { BlogModule } from './blog/blog.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { ContactLeadsModule } from './contact-leads/contact-leads.module';
import { ScheduleModule } from './schedule/schedule.module';
import { FinanceModule } from './finance/finance.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { MailModule } from './mail/mail.module';
import { StorageModule } from './storage/storage.module';
import { CacheModule } from './cache/cache.module';
import { QueuesModule } from './queues/queues.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [
        appConfig,
        databaseConfig,
        authConfig,
        mailConfig,
        cloudinaryConfig,
        redisConfig,
        queueConfig,
      ],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.getOrThrow<number>('RATE_LIMIT_TTL') * 1000,
          limit: config.getOrThrow<number>('RATE_LIMIT_LIMIT'),
        },
      ],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.getOrThrow<string>('redis.host'),
          port: config.getOrThrow<number>('redis.port'),
          password: config.get<string>('redis.password') || undefined,
        },
      }),
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AdminUsersModule,
    ClientsModule,
    ClientAccountsModule,
    ProjectsModule,
    ProjectStagesModule,
    BriefingsModule,
    ApprovalsModule,
    PreviewsModule,
    ClientRequestsModule,
    InboxModule,
    SupportModule,
    FilesModule,
    UploadsModule,
    BlogModule,
    NewsletterModule,
    ContactLeadsModule,
    ScheduleModule,
    FinanceModule,
    NotificationsModule,
    AuditLogsModule,
    MailModule,
    StorageModule,
    CacheModule,
    QueuesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
