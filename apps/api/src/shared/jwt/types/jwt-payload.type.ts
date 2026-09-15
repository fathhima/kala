import { UserRole } from "@/shared/enums/role.enum"

export type TokenType = 'access' | 'refresh'

export type AccessTokenPayload = {
    sub: string,
    roles: UserRole[],
    type: 'access'
}

export type RefreshTokenPayload = {
    sub: string,
    sessionId: string,
    type: 'refresh'
}

export type JwtPayload = AccessTokenPayload | RefreshTokenPayload