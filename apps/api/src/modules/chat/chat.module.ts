import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { ChatController } from './chat.controller';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './services/chat.service';
import { CHAT_SERVICE } from './services/interfaces/chat.service.interface';
import { PrismaChatRepository } from './repositories/prisma-chat.repository';
import { CHAT_REPOSITORY } from './repositories/interfaces/chat.repository.interface';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { ChatBookingListener } from './listeners/chat-booking.listener';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    WsJwtGuard,
    ChatBookingListener,
    PrismaChatRepository,
    {
      provide: CHAT_REPOSITORY,
      useExisting: PrismaChatRepository,
    },
    {
      provide: CHAT_SERVICE,
      useClass: ChatService,
    },
  ],
  exports: [CHAT_SERVICE, CHAT_REPOSITORY],
})
export class ChatModule {}
