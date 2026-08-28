export type GoogleProfile = {
    googleId: string;
    email: string;
    name: string;
    picture?: string | null;
    emailVerified: boolean;
};