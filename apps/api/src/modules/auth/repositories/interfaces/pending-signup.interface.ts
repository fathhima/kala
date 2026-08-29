import { PendingSignup } from "../../types/pending-signup.type";

export const PENDING_SIGNUP_REPOSITORY = Symbol("PENDING_SIGNUP_REPOSITORY",);

export interface IPendingSignupRepository {
    save(signup: PendingSignup, ttlSeconds: number): Promise<void>;

    findById(id: string): Promise<PendingSignup | null>;

    findIdByEmail(email: string): Promise<string | null>;

    getTtl(id: string): Promise<number>;

    delete(id: string, email: string): Promise<void>;
}