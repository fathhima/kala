import { Injectable } from "@nestjs/common";
import { JwtPayload } from "./types/jwt-payload.type";
import { ConfigService } from "@nestjs/config";
import jwt from 'jsonwebtoken';


@Injectable()
export class JwtService {
  constructor(private readonly configService: ConfigService) { }

  async signAccessToken(payload: JwtPayload): Promise<string> {
    return jwt.sign(payload, this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'), { expiresIn: '15m' })
  }
  async signRefreshToken(payload: JwtPayload): Promise<string> {
    return jwt.sign(payload, this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'), { expiresIn: '7d' })
  }
  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return jwt.verify(token, this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'))
  }
  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return jwt.verify(token, this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'))
  }
}