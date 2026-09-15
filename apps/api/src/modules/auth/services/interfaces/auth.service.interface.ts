import { AuthResult, RefreshResult, RegisterResult, ResendOtpResult, ValidateResetTokenResult } from "../../types/auth-result.type";
import { ChangePasswordInput, ForgotPasswordInput, GoogleSignInInput, LoginInput, RegisterInput, ResendOtpInput, ResetPasswordInput, ValidateResetTokenInput, VerifyOtpInput } from "../../types/auth.type";

export const AUTH_SERVICE = Symbol('AUTH_SERVICE');

export interface IAuthService {
    register(input: RegisterInput): Promise<RegisterResult>;

    verifyOtp(input: VerifyOtpInput): Promise<AuthResult>;

    resendOtp(input: ResendOtpInput): Promise<ResendOtpResult>;

    login(input: LoginInput): Promise<AuthResult>;

    refresh(refreshToken: string): Promise<RefreshResult>;

    forgotPassword(input: ForgotPasswordInput): Promise<void>;

    validateResetToken(input: ValidateResetTokenInput): Promise<ValidateResetTokenResult>;

    resetPassword(input: ResetPasswordInput): Promise<void>;

    googleSignin(input: GoogleSignInInput): Promise<AuthResult>;

    logout(refreshToken?: string): Promise<void>;

    logoutAll(userId: string): Promise<void>;

    changePassword(userId: string, input: ChangePasswordInput): Promise<void>;
}