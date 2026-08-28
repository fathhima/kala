import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AccessTokenPayload, RefreshTokenPayload } from "./types/jwt-payload.type";
import { ConfigService } from "@nestjs/config";
import * as jwt from 'jsonwebtoken';
import { parseDurationToSeconds } from "./utils/parse-duration-seconds";

@Injectable()
export class JwtService {
  constructor(private readonly _configService: ConfigService) { }

  private _getAccessTokenExpiresIn(): jwt.SignOptions['expiresIn'] {
    return this._configService.getOrThrow<string>('ACCESS_TOKEN_EXPIRES_IN') as jwt.SignOptions['expiresIn']
  }

  private _getRefreshTokenExpiresIn(): jwt.SignOptions['expiresIn'] {
    return this._configService.getOrThrow<string>('REFRESH_TOKEN_EXPIRES_IN') as jwt.SignOptions['expiresIn']
  }

  private _getRefreshTokenExpiresInRaw(): string {
    return this._configService.getOrThrow<string>("REFRESH_TOKEN_EXPIRES_IN");
  }

  getRefreshTokenTtlSeconds(): number {
    return parseDurationToSeconds(this._getRefreshTokenExpiresInRaw())
  }

  async signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): Promise<string> {
    return jwt.sign({
      ...payload,
      type: 'access'
    }, this._configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'), { expiresIn: this._getAccessTokenExpiresIn() })
  }

  async signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): Promise<string> {
    return jwt.sign({
      ...payload,
      type: 'refresh'
    }, this._configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'), { expiresIn: this._getRefreshTokenExpiresIn() })
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    try {
      const payload = jwt.verify(token, this._configService.getOrThrow<string>('ACCESS_TOKEN_SECRET')) as AccessTokenPayload

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
      const payload = jwt.verify(token, this._configService.getOrThrow<string>('REFRESH_TOKEN_SECRET')) as RefreshTokenPayload

      if (payload.type !== 'refresh' || !payload.sub || !payload.sessionId) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      return payload
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }
}