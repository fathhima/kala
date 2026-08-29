import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

import { USER_REPOSITORY } from "@/modules/user/repositories/interfaces/user.interface";
import type { IUserRepository } from "@/modules/user/repositories/interfaces/user.interface";
import { IS_PUBLIC_KEY } from "@/shared/decorators/public.decorator";
import { JwtService } from "@/shared/jwt/jwt.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly _reflector: Reflector,
    private readonly _jwtService: JwtService,
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this._extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("Access token is missing");
    }

    try {
      const payload = await this._jwtService.verifyAccessToken(token);

      const user = await this._userRepository.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      if (!user.isActive) {
        throw new ForbiddenException("Account is blocked");
      }

      if (!user.isVerified) {
        throw new ForbiddenException("Email is not verified");
      }

      request.user = {
        sub: user.id,
        roles: user.roles,
        type: 'access'
      }
      
      return true;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new UnauthorizedException("Invalid or expired access token");
    }
  }

  private _extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return null;
    }

    return token;
  }
}