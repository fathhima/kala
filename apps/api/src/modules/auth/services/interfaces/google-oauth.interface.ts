import { GoogleProfile } from '../../types/google-profile.type';

export const GOOGLE_OAUTH_PROVIDER = Symbol('GOOGLE_OAUTH_PROVIDER');

export interface IGoogleOAuthProvider {
    verifyIdToken(idToken: string): Promise<GoogleProfile>;
}