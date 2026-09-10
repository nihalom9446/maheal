import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { FamilyModule } from './modules/family/family.module';
import { MemberModule } from './modules/member/member.module';
import { PrayerModule } from './modules/prayer/prayer.module';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { FinanceModule } from './modules/finance/finance.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { PaymentModule } from './modules/payment/payment.module';
import { MadrasaModule } from './modules/madrasa/madrasa.module';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 20,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 200,
      },
    ]),
    DatabaseModule,
    AuditModule,
    AuthModule,
    FamilyModule,
    MemberModule,
    PrayerModule,
    AnnouncementModule,
    FinanceModule,
    PaymentModule,
    NotificationModule,
    HealthModule,
    CertificateModule,
    MadrasaModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}