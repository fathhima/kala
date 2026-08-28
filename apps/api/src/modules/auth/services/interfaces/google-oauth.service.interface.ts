import { GoogleProfile } from '../../types/google-profile.type';

export const GOOGLE_OAUTH_SERVICE = Symbol('GOOGLE_OAUTH_SERVICE');

export interface IGoogleOAuthService {
    verifyIdToken(idToken: string): Promise<GoogleProfile>;
}