import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OAuth2Client } from 'google-auth-library'

export interface GoogleTokenPayload {
    email: string
    name: string
    picture?: string
    email_verified?: boolean
    sub: string
}

@Injectable()
export class GoogleOAuthService {
    private oauth2Client: OAuth2Client

    constructor(private configService: ConfigService) {
        this.oauth2Client = new OAuth2Client(
            this.configService.get<string>('GOOGLE_CLIENT_ID'),
        )
    }

    async verifyIdToken(idToken: string): Promise<GoogleTokenPayload> {
        try {
            // useGoogleLogin with implicit flow returns an access token, not a JWT id token.
            if (!this.isJwt(idToken)) {
                const userInfo = await this.fetchUserInfoByAccessToken(idToken)

                return {
                    email: userInfo.email,
                    name: userInfo.name || 'User',
                    picture: userInfo.picture,
                    email_verified: userInfo.email_verified || false,
                    sub: userInfo.sub,
                }
            }

            const ticket = await this.oauth2Client.verifyIdToken({
                idToken,
                audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
            })

            const payload = ticket.getPayload()

            if (!payload) {
                throw new UnauthorizedException('Invalid Google token payload')
            }

            if (!payload.email) {
                throw new UnauthorizedException('Google token missing email')
            }

            return {
                email: payload.email,
                name: payload.name || 'User',
                picture: payload.picture,
                email_verified: payload.email_verified || false,
                sub: payload.sub,
            }
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error
            }
            throw new UnauthorizedException('Failed to verify Google token')
        }
    }

    private isJwt(token: string): boolean {
        return token.split('.').length === 3
    }

    private async fetchUserInfoByAccessToken(accessToken: string): Promise<GoogleTokenPayload> {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        if (!response.ok) {
            throw new UnauthorizedException('Invalid Google access token')
        }

        const payload = (await response.json()) as Partial<GoogleTokenPayload>

        if (!payload.email || !payload.sub) {
            throw new UnauthorizedException('Google token missing required profile fields')
        }

        return {
            email: payload.email,
            name: payload.name || 'User',
            picture: payload.picture,
            email_verified: payload.email_verified || false,
            sub: payload.sub,
        }
    }
}
