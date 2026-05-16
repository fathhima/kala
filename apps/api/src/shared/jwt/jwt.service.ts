import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AccessTokenPayload, RefreshTokenPayload } from "./types/jwt-payload.type";
import { ConfigService } from "@nestjs/config";
import * as jwt from 'jsonwebtoken';
import { parseDurationToSeconds } from "./utils/parse-duration-seconds";

@Injectable()
export class JwtService {
  constructor(private readonly configService: ConfigService) { }

  private getAccessTokenExpiresIn(): jwt.SignOptions['expiresIn'] {
    return this.configService.getOrThrow<string>('ACCESS_TOKEN_EXPIRES_IN') as jwt.SignOptions['expiresIn']
  }

  private getRefreshTokenExpiresIn(): jwt.SignOptions['expiresIn'] {
    return this.configService.getOrThrow<string>('REFRESH_TOKEN_EXPIRES_IN') as jwt.SignOptions['expiresIn']
  }

  private getRefreshTokenExpiresInRaw(): string {
    return this.configService.getOrThrow<string>("REFRESH_TOKEN_EXPIRES_IN");
  }

  getRefreshTokenTtlSeconds(): number {
    return parseDurationToSeconds(this.getRefreshTokenExpiresInRaw())
  }

  async signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): Promise<string> {
    return jwt.sign({
      ...payload,
      type: 'access'
    }, this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'), { expiresIn: this.getAccessTokenExpiresIn() })
  }

  async signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): Promise<string> {
    return jwt.sign({
      ...payload,
      type: 'refresh'
    }, this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'), { expiresIn: this.getRefreshTokenExpiresIn() })
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      const payload = jwt.verify(token, this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET')) as AccessTokenPayload

      if (payload.type !== 'access' || !payload.sub || !Array.isArray(payload.roles)) {
        throw new UnauthorizedException('Invalid access token')
      }

      return payload
    } catch (error) {
      throw new UnauthorizedException('Invalid access token')
    }
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      const payload = jwt.verify(token, this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET')) as RefreshTokenPayload

      if (payload.type !== 'refresh' || !payload.sub || !payload.sessionId) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      return payload
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }
}