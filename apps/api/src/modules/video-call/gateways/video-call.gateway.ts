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
import {
  VIDEO_CALL_SERVICE,
  type IVideoCallService,
} from '../services/interfaces/video-call.service.interface';
import {
  JWT_SERVICE,
  type IJwtService,
} from '@/shared/jwt/repositories/interfaces/token.interface';
import {
  USER_IDENTITY_SERVICE,
  type IUserIdentityService,
} from '@/modules/user/services/interfaces/user-identity.service.interface';
import {
  LOGGER_SERVICE,
  type ILoggerService,
} from '@/shared/logger/repositories/interfaces/logger.interface';

interface AuthenticatedSocket extends Socket {
  data: {
    user?: {
      id: string;
      email: string;
      roles: string[];
    };
    currentBookingId?: string;
  };
}

@Injectable()
@WebSocketGateway({
  namespace: '/video-call',
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:5173'],
    credentials: true,
  },
})
export class VideoCallGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  // Track active room participants: bookingId -> Set of socket IDs
  private readonly _roomParticipants = new Map<string, Set<string>>();

  constructor(
    @Inject(VIDEO_CALL_SERVICE)
    private readonly _videoCallService: IVideoCallService,
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
        this._logger.warn(
          `Rejected VideoCall connection: missing token (${client.id})`,
          VideoCallGateway.name,
        );
        client.disconnect(true);
        return;
      }

      const payload = await this._jwtService.verifyAccessToken(token);
      const user = await this._userIdentityService.findById(payload.sub);

      if (!user || !user.isActive || !user.isVerified) {
        this._logger.warn(
          `Rejected VideoCall connection: inactive or unverified user (${client.id})`,
          VideoCallGateway.name,
        );
        client.disconnect(true);
        return;
      }

      client.data.user = {
        id: user.id,
        email: user.email,
        roles: user.roles,
      };

      this._logger.log(
        `VideoCall client connected: user ${user.id} (socket ${client.id})`,
        VideoCallGateway.name,
      );
    } catch (error) {
      this._logger.warn(
        `VideoCall socket auth failed (${client.id}): ${error instanceof Error ? error.message : String(error)}`,
        VideoCallGateway.name,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    const userId = client.data?.user?.id ?? 'anonymous';
    const bookingId = client.data?.currentBookingId;

    if (bookingId) {
      this._removeParticipant(bookingId, client.id);
      const roomName = `session:${bookingId}`;
      client.to(roomName).emit('peer_left', {
        userId,
        socketId: client.id,
      });
      this._logger.log(
        `User ${userId} left room ${roomName} on disconnect`,
        VideoCallGateway.name,
      );
    }

    this._logger.log(
      `VideoCall client disconnected: user ${userId} (socket ${client.id})`,
      VideoCallGateway.name,
    );
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_session')
  async handleJoinSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { bookingId: string },
  ) {
    if (!payload?.bookingId) {
      throw new WsException('bookingId is required to join a video session');
    }

    const userId = client.data.user!.id;
    const access = await this._videoCallService.validateSessionAccess(
      userId,
      payload.bookingId,
    );

    if (!access.canJoin) {
      throw new WsException(
        access.reason || 'Cannot join video session at this time',
      );
    }

    const roomName = `session:${payload.bookingId}`;
    await client.join(roomName);
    client.data.currentBookingId = payload.bookingId;

    // Check if other participant is already in the room
    const currentSockets = this._roomParticipants.get(payload.bookingId) ?? new Set();
    const otherInRoom = currentSockets.size > 0;

    this._addParticipant(payload.bookingId, client.id);

    this._logger.log(
      `User ${userId} joined video session room ${roomName} (total in room: ${currentSockets.size + 1})`,
      VideoCallGateway.name,
    );

    // Notify the other peer that this user has joined
    client.to(roomName).emit('peer_joined', {
      userId,
      role: access.currentUserRole,
      socketId: client.id,
    });

    return {
      event: 'session_joined',
      data: {
        access,
        otherPeerPresent: otherInRoom,
      },
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('signal_offer')
  handleSignalOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { bookingId: string; sdp: unknown },
  ): void {
    if (!payload?.bookingId || !payload?.sdp) {
      throw new WsException('bookingId and sdp are required');
    }

    const roomName = `session:${payload.bookingId}`;
    client.to(roomName).emit('signal_offer', {
      senderId: client.data.user!.id,
      sdp: payload.sdp,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('signal_answer')
  handleSignalAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { bookingId: string; sdp: unknown },
  ): void {
    if (!payload?.bookingId || !payload?.sdp) {
      throw new WsException('bookingId and sdp are required');
    }

    const roomName = `session:${payload.bookingId}`;
    client.to(roomName).emit('signal_answer', {
      senderId: client.data.user!.id,
      sdp: payload.sdp,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('signal_ice_candidate')
  handleIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { bookingId: string; candidate: unknown },
  ): void {
    if (!payload?.bookingId || !payload?.candidate) {
      return;
    }

    const roomName = `session:${payload.bookingId}`;
    client.to(roomName).emit('signal_ice_candidate', {
      senderId: client.data.user!.id,
      candidate: payload.candidate,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('media_state_change')
  handleMediaStateChange(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    payload: {
      bookingId: string;
      isMuted: boolean;
      isCameraOff: boolean;
      isScreenSharing?: boolean;
    },
  ): void {
    if (!payload?.bookingId) return;

    const roomName = `session:${payload.bookingId}`;
    client.to(roomName).emit('peer_media_state', {
      userId: client.data.user!.id,
      isMuted: Boolean(payload.isMuted),
      isCameraOff: Boolean(payload.isCameraOff),
      isScreenSharing: Boolean(payload.isScreenSharing),
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave_session')
  async handleLeaveSession(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { bookingId: string },
  ) {
    if (!payload?.bookingId) return;

    const roomName = `session:${payload.bookingId}`;
    await client.leave(roomName);
    this._removeParticipant(payload.bookingId, client.id);
    delete client.data.currentBookingId;

    client.to(roomName).emit('peer_left', {
      userId: client.data.user!.id,
      socketId: client.id,
    });

    return { event: 'session_left', bookingId: payload.bookingId };
  }

  /**
   * Broadcast an administrative session termination (e.g. instructor marked complete)
   */
  notifySessionEnded(bookingId: string, reason?: string): void {
    const roomName = `session:${bookingId}`;
    this.server.to(roomName).emit('session_ended', {
      bookingId,
      reason: reason || 'Session has ended',
    });
  }

  private _addParticipant(bookingId: string, socketId: string): void {
    let sockets = this._roomParticipants.get(bookingId);
    if (!sockets) {
      sockets = new Set();
      this._roomParticipants.set(bookingId, sockets);
    }
    sockets.add(socketId);
  }

  private _removeParticipant(bookingId: string, socketId: string): void {
    const sockets = this._roomParticipants.get(bookingId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this._roomParticipants.delete(bookingId);
      }
    }
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
