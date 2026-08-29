import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";
import { GoogleProfile } from "../types/google-profile.type";
import { IGoogleOAuthService } from "./interfaces/google-oauth.service.interface";

@Injectable()
export class GoogleOAuthService implements IGoogleOAuthService {
    private readonly _client: OAuth2Client;
    private readonly _googleClientId: string;

    constructor(private readonly _configService: ConfigService) {
        this._googleClientId = this._configService.getOrThrow<string>("GOOGLE_CLIENT_ID");
        this._client = new OAuth2Client(this._googleClientId);
    }

    async verifyIdToken(idToken: string): Promise<GoogleProfile> {
        const ticket = await this._client.verifyIdToken({
            idToken,
            audience: this._googleClientId,
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