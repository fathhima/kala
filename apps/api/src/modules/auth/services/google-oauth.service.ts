import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";
import { GoogleProfile } from "../types/google-profile.type";

@Injectable()
export class GoogleOAuthService {
    private readonly client: OAuth2Client;
    private readonly googleClientId: string;

    constructor(private readonly configService: ConfigService) {
        this.googleClientId = this.configService.getOrThrow<string>("GOOGLE_CLIENT_ID");
        this.client = new OAuth2Client(this.googleClientId);
    }

    async verifyIdToken(idToken: string): Promise<GoogleProfile> {
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience: this.googleClientId,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            throw new UnauthorizedException("Invalid Google token");
        }

        if (!payload.sub || !payload.email) {
            throw new UnauthorizedException("Google account data is incomplete");
        }

        if (!payload.email_verified) {
            throw new UnauthorizedException('Google account email is not verified',);
        }

        return {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name ?? payload.email.split("@")[0],
            picture: payload.picture ?? null,
            emailVerified: true,
        };
    }
}