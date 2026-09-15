import { Inject, Injectable } from "@nestjs/common";
import { TOKEN_PROVIDER, type ITokenProvider, IJwtService } from "./repositories/interfaces/token.interface";
import { AccessTokenPayload, RefreshTokenPayload } from "./types/jwt-payload.type";

@Injectable()
export class JwtService implements IJwtService {
  constructor(
    @Inject(TOKEN_PROVIDER)
    private readonly _tokenProvider: ITokenProvider,
  ) { }

  getRefreshTokenTtlSeconds(): number {
    return this._tokenProvider.getRefreshTokenTtlSeconds();
  }

  signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): Promise<string> {
    return this._tokenProvider.signAccessToken(payload);
  }

  signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): Promise<string> {
    return this._tokenProvider.signRefreshToken(payload);
  }

  verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return this._tokenProvider.verifyAccessToken(token);
  }

  verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this._tokenProvider.verifyRefreshToken(token);
  }
}
