import { Role } from "@prisma/client"

export type TokenType = 'access' | 'refresh'

export type AccessTokenPayload = {
    sub: string,
    roles: Role[],
    type: 'access'
}

export type RefreshTokenPayload = {
    sub: string,
    sessionId: string,
    type: 'refresh'
}

export type JwtPayload = AccessTokenPayload | RefreshTokenPayload