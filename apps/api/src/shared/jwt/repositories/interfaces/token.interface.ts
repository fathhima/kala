import { AccessTokenPayload, RefreshTokenPayload } from '../../types/jwt-payload.type';

export const TOKEN_PROVIDER = Symbol('TOKEN_PROVIDER');
export const JWT_SERVICE = Symbol('JWT_SERVICE');

export interface ITokenProvider {
    getRefreshTokenTtlSeconds(): number;

    signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): Promise<string>;

    signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): Promise<string>;

    verifyAccessToken(token: string): Promise<AccessTokenPayload>; 

    verifyRefreshToken(token: string): Promise<RefreshTokenPayload>;
}

export type IJwtService = ITokenProvider;