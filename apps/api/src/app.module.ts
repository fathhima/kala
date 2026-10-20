import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConfigModule } from './shared/config/config.module';
import { RedisModule } from './shared/redis/redis.module';
import { MailerModule } from './shared/mailer/mailer.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { JwtModule } from './shared/jwt/jwt.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { AdminModule } from './modules/admin/admin.module';
import { CategoryModule } from './modules/category/category.module';
import { InstructorModule } from './modules/instructor/instructor.module';
import { SlotModule } from './modules/slot/slot.module';
import { LoggerModule } from './shared/logger/logger.module';
import { BookingModule } from './modules/booking/booking.module';
import { PaymentModule } from './modules/payment/payment.module';
import { QueueModule } from './shared/queue/queue.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OutboxModule } from './shared/outbox/outbox.module';

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
        storage: new ThrottlerStorageRedisService(
          config.getOrThrow<string>('REDIS_URI'),
        ),
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
    AuthModule,
    UserModule,
    CategoryModule,
    AdminModule,
    InstructorModule,
    SlotModule,
    BookingModule,
    PaymentModule,
  ],
  providers: [
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
