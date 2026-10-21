import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Injectable, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../guards/ws-jwt.guard';
import { CHAT_SERVICE, type IChatService } from '../services/interfaces/chat.service.interface';
import { JWT_SERVICE, type IJwtService } from '@/shared/jwt/repositories/interfaces/token.interface';
import { USER_IDENTITY_SERVICE, type IUserIdentityService } from '@/modules/user/services/interfaces/user-identity.service.interface';
import { LOGGER_SERVICE, type ILoggerService } from '@/shared/logger/repositories/interfaces/logger.interface';
import { MessageType } from '../enums/message-type.enum';

interface AuthenticatedSocket extends Socket {
  data: {
    user?: {
      id: string;
      email: string;
      roles: string[];
    };
  };
}

@Injectable()
@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:5173'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject(CHAT_SERVICE)
    private readonly _chatService: IChatService,
    @Inject(JWT_SERVICE)
    private readonly _jwtService: IJwtService,
    @Inject(USER_IDENTITY_SERVICE)
    private readonly _userIdentityService: IUserIdentityService,
    @Inject(LOGGER_SERVICE)
    private readonly _logger: ILoggerService,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = this._extractToken(client);
      if (!token) {
        this._logger.warn(`Rejected WebSocket connection: missing token (${client.id})`, ChatGateway.name);
        client.disconnect(true);
        return;
      }

      const payload = await this._jwtService.verifyAccessToken(token);
      const user = await this._userIdentityService.findById(payload.sub);

      if (!user || !user.isActive || !user.isVerified) {
        this._logger.warn(`Rejected WebSocket connection: inactive or unverified user (${client.id})`, ChatGateway.name);
        client.disconnect(true);
        return;
      }

      client.data.user = {
        id: user.id,
        email: user.email,
        roles: user.roles,
      };

      this._logger.log(`Client connected: user ${user.id} (socket ${client.id})`, ChatGateway.name);
    } catch (error) {
      this._logger.warn(
        `Socket connection auth failed (${client.id}): ${error instanceof Error ? error.message : String(error)}`,
        ChatGateway.name,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    const userId = client.data?.user?.id ?? 'anonymous';
    this._logger.log(`Client disconnected: user ${userId} (socket ${client.id})`, ChatGateway.name);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { bookingId: string },
  ) {
    if (!payload?.bookingId) {
      throw new WsException('bookingId is required to join a room');
    }

    const userId = client.data.user!.id;
    const access = await this._chatService.checkRoomAccess(userId, payload.bookingId);

    const roomName = `booking:${payload.bookingId}`;
    await client.join(roomName);

    this._logger.log(`User ${userId} joined socket room ${roomName}`, ChatGateway.name);

    return {
      event: 'room_joined',
      data: {
        bookingId: payload.bookingId,
        roomId: access.roomId,
        canWrite: access.canWrite,
        readOnlyReason: access.readOnlyReason,
      },
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    payload: {
      bookingId: string;
      content: string;
      type?: MessageType;
      tempId?: string;
    },
  ) {
    if (!payload?.bookingId || !payload?.content?.trim()) {
      throw new WsException('bookingId and non-empty content are required');
    }

    const userId = client.data.user!.id;

    try {
      const response = await this._chatService.sendMessage(
        userId,
        payload.bookingId,
        payload.content.trim(),
        payload.type,
        payload.tempId,
      );

      const roomName = `booking:${payload.bookingId}`;
      this.server.to(roomName).emit('new_message', response.data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      throw new WsException(errorMessage);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { bookingId: string; isTyping: boolean },
  ): void {
    if (!payload?.bookingId) return;

    const roomName = `booking:${payload.bookingId}`;
    client.to(roomName).emit('user_typing', {
      bookingId: payload.bookingId,
      userId: client.data.user!.id,
      isTyping: Boolean(payload.isTyping),
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { bookingId: string },
  ) {
    if (!payload?.bookingId) return;

    const userId = client.data.user!.id;
    const { count } = await this._chatService.markAsRead(userId, payload.bookingId);

    const roomName = `booking:${payload.bookingId}`;
    this.server.to(roomName).emit('messages_read', {
      bookingId: payload.bookingId,
      readerId: userId,
      count,
    });

    return { success: true, count };
  }

  private _extractToken(client: AuthenticatedSocket): string | null {
    const authHeader =
      (client.handshake?.auth?.token as string) ||
      (client.handshake?.headers?.authorization as string);

    if (!authHeader) {
      return null;
    }

    if (authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }

    return authHeader.trim();
  }
}
