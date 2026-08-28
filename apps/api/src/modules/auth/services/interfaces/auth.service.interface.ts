import { ChangePasswordDto } from "../../dto/request/change-password.dto";
import { ForgotPasswordDto } from "../../dto/request/forgot-password.dto";
import { GoogleSignInRequestDto } from "../../dto/request/google-signin.dto";
import { LoginDto } from "../../dto/request/login.dto";
import { RegisterDto } from "../../dto/request/register.dto";
import { ResendOtpDto } from "../../dto/request/resend-otp.dto";
import { ResetPasswordDto } from "../../dto/request/reset-password.dto";
import { ValidateResetTokenDto } from "../../dto/request/validate-reset-token.dto";
import { VerifyOtpDto } from "../../dto/request/verify-otp.dto";
import { AuthResult, RefreshResult, RegisterResult, ResendOtpResult, ValidateResetTokenResult } from "../../types/auth-result.type";

export const AUTH_SERVICE = Symbol('AUTH_SERVICE');

export interface IAuthService {
    register(dto: RegisterDto): Promise<RegisterResult>;

    verifyOtp(dto: VerifyOtpDto): Promise<AuthResult>;

    resendOtp(dto: ResendOtpDto): Promise<ResendOtpResult>;

    login(dto: LoginDto): Promise<AuthResult>;

    refresh(refreshToken: string): Promise<RefreshResult>;

    forgotPassword(dto: ForgotPasswordDto): Promise<void>;

    validateResetToken(dto: ValidateResetTokenDto): Promise<ValidateResetTokenResult>;

    resetPassword(dto: ResetPasswordDto): Promise<void>;

    googleSignin(dto: GoogleSignInRequestDto): Promise<AuthResult>;

    logout(refreshToken?: string): Promise<void>;

    logoutAll(userId: string): Promise<void>;

    changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
}