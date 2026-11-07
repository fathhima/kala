import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingModule } from './modules/booking/booking.module';
import { CategoryModule } from './modules/category/category.module';
import { ChatModule } from './modules/chat/chat.module';
import { InstructorModule } from './modules/instructor/instructor.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SlotModule } from './modules/slot/slot.module';
import { UserModule } from './modules/user/user.module';
import { VideoCallModule } from './modules/video-call/video-call.module';
import { ConfigModule } from './shared/config/config.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { HealthModule } from './shared/health/health.module';
import { JwtModule } from './shared/jwt/jwt.module';
import { LoggerModule } from './shared/logger/logger.module';
import { MailerModule } from './shared/mailer/mailer.module';
import { HttpMetricsInterceptor } from './shared/metrics/interceptors/http-metrics.interceptor';
import { MetricsModule } from './shared/metrics/metrics.module';
import { OutboxModule } from './shared/outbox/outbox.module';
import { QueueModule } from './shared/queue/queue.module';
import { RedisModule } from './shared/redis/redis.module';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60_000,
            limit: 60,
          },
        ],
        storage: new ThrottlerStorageRedisService(config.getOrThrow<string>('REDIS_URI')),
      }),
    }),
    EventEmitterModule.forRoot(),
    JwtModule,
    ConfigModule,
    LoggerModule,
    RedisModule,
    QueueModule,
    OutboxModule,
    MailerModule,
    NotificationModule,
    MetricsModule,
    HealthModule,
    AuthModule,
    UserModule,
    CategoryModule,
    AdminModule,
    InstructorModule,
    SlotModule,
    BookingModule,
    PaymentModule,
    ChatModule,
    VideoCallModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
