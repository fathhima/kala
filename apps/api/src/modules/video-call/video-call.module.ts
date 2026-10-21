import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@/shared/config/config.module';
import { VideoCallController } from './video-call.controller';
import { VideoCallGateway } from './gateways/video-call.gateway';
import { VideoCallService } from './services/video-call.service';
import { VIDEO_CALL_SERVICE } from './services/interfaces/video-call.service.interface';
import { PrismaVideoCallRepository } from './repositories/prisma-video-call.repository';
import { VIDEO_CALL_REPOSITORY } from './repositories/interfaces/video-call.repository.interface';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Module({
  imports: [PrismaModule, UserModule, ConfigModule],
  controllers: [VideoCallController],
  providers: [
    VideoCallGateway,
    WsJwtGuard,
    PrismaVideoCallRepository,
    {
      provide: VIDEO_CALL_REPOSITORY,
      useExisting: PrismaVideoCallRepository,
    },
    {
      provide: VIDEO_CALL_SERVICE,
      useClass: VideoCallService,
    },
  ],
  exports: [VIDEO_CALL_SERVICE, VIDEO_CALL_REPOSITORY, VideoCallGateway],
})
export class VideoCallModule {}
