import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";

@Injectable()
export class JwtService {

  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.accessSecret = this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET')
    this.refreshSecret = this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET')
  }

  generateAccessToken(payload: any) {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: "15m",
    });
  }

  generateRefreshToken(payload: any) {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: "7d",
    });
  }

  verifyAccessToken(token: string) {
    try {
      return jwt.verify(token, this.accessSecret);
    } catch {
      throw new UnauthorizedException("Invalid access token");
    }
  }

  verifyRefreshToken(token: string) {
    try {
      return jwt.verify(token, this.refreshSecret);
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}