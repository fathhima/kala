import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JWT_SERVICE, type IJwtService } from '@/shared/jwt/repositories/interfaces/token.interface';
import { USER_IDENTITY_SERVICE, type IUserIdentityService } from '@/modules/user/services/interfaces/user-identity.service.interface';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    @Inject(JWT_SERVICE)
    private readonly _jwtService: IJwtService,
    @Inject(USER_IDENTITY_SERVICE)
    private readonly _userIdentityService: IUserIdentityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    // If already authenticated during connection handshake
    if (client.data?.user) {
      return true;
    }

    const token = this._extractToken(client);
    if (!token) {
      throw new WsException('Missing authentication token');
    }

    try {
      const payload = await this._jwtService.verifyAccessToken(token);
      const user = await this._userIdentityService.findById(payload.sub);

      if (!user || !user.isActive || !user.isVerified) {
        throw new WsException('User is not authorized or active');
      }

      client.data.user = {
        id: user.id,
        email: user.email,
        roles: user.roles,
      };

      return true;
    } catch {
      throw new WsException('Invalid or expired WebSocket authentication token');
    }
  }

  private _extractToken(client: Socket): string | null {
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
