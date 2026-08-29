import { BadRequestException, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { RegisterDto } from "../dto/request/register.dto";
import { USER_REPOSITORY } from "@/modules/user/repositories/interfaces/user.interface";
import type { IUserRepository } from "@/modules/user/repositories/interfaces/user.interface";
import * as bcrypt from 'bcrypt'
import { PendingSignup } from "../types/pending-signup.type";
import { MailerService } from "@/shared/mailer/mailer.service";
import { VerifyOtpDto } from "../dto/request/verify-otp.dto";
import { Prisma, Role } from "@prisma/client";
import { JwtService } from "@/shared/jwt/jwt.service";
import { ConfigService } from "@nestjs/config";
import { LoginDto } from "../dto/request/login.dto";
import { generateOtp } from "../utils/generate-otp";
import { normalizeEmail } from "../utils/normalize-email";
import { ResendOtpDto } from "../dto/request/resend-otp.dto";
import { createHash, randomBytes, randomUUID } from "crypto";
import { maskEmail } from "../utils/masked-email";
import { ForgotPasswordDto } from "../dto/request/forgot-password.dto";
import { ValidateResetTokenDto } from "../dto/request/validate-reset-token.dto";
import { ResetPasswordDto } from "../dto/request/reset-password.dto";
import { GoogleSignInRequestDto } from "../dto/request/google-signin.dto";
import { AuthResult, RefreshResult } from "../types/auth-result.type";
import { UserRole } from "@/shared/enums/role.enum";
import { REFRESH_SESSION_REPOSITORY } from "../repositories/interfaces/refresh-session.interface";
import type { IRefreshSessionRepository } from "../repositories/interfaces/refresh-session.interface";
import { PENDING_SIGNUP_REPOSITORY, type IPendingSignupRepository } from "../repositories/interfaces/pending-signup.interface";
import { PASSWORD_RESET_REPOSITORY, type IPasswordResetRepository } from "../repositories/interfaces/password-reset.interface";
import { ChangePasswordDto } from "../dto/request/change-password.dto";
import { IAuthService } from "./interfaces/auth.service.interface";
import { GOOGLE_OAUTH_SERVICE, type IGoogleOAuthService } from "./interfaces/google-oauth.service.interface";

@Injectable()
export class AuthService implements IAuthService {
    private readonly _otpTtlSeconds: number;
    private readonly _otpResendCooldownSeconds: number;
    private readonly _refreshTokenTtlSeconds: number;
    private readonly _passwordResetTtlSeconds: number;
    private readonly _passwordResetUrl: string;

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly _userRepository: IUserRepository,
        @Inject(REFRESH_SESSION_REPOSITORY)
        private readonly _refreshSessionRepository: IRefreshSessionRepository,
        @Inject(PENDING_SIGNUP_REPOSITORY)
        private readonly _pendingSignupRepository: IPendingSignupRepository,
        @Inject(PASSWORD_RESET_REPOSITORY)
        private readonly _passwordResetRepository: IPasswordResetRepository,
        @Inject(GOOGLE_OAUTH_SERVICE)
        private readonly _googleOAuthService: IGoogleOAuthService,
        private readonly _mailerService: MailerService,
        private readonly _jwtService: JwtService,
        private readonly _configService: ConfigService,

    ) {
        this._otpTtlSeconds = this._configService.getOrThrow<number>('OTP_TTL_SECONDS')
        this._refreshTokenTtlSeconds = this._jwtService.getRefreshTokenTtlSeconds()
        this._passwordResetTtlSeconds =
            this._configService.getOrThrow<number>("PASSWORD_RESET_TTL_SECONDS");
        this._passwordResetUrl =
            this._configService.getOrThrow<string>("PASSWORD_RESET_URL");
        this._otpResendCooldownSeconds = this._configService.getOrThrow<number>("OTP_RESEND_COOLDOWN_SECONDS");
    }

    async register(dto: RegisterDto) {
        const email = normalizeEmail(dto.email);

        const existingUser = await this._userRepository.findByEmail(email)
        if (existingUser?.isVerified) {
            throw new BadRequestException('Email already registered')
        }

        const existingPendingId = await this._pendingSignupRepository.findIdByEmail(email)
        if (existingPendingId) {
            await this._pendingSignupRepository.delete(existingPendingId, email)
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10)
        const otp = generateOtp()
        const otpHash = await bcrypt.hash(otp, 10)
        const pendingSignupId = randomUUID()

        const pendingSignup: PendingSignup = {
            id: pendingSignupId,
            name: dto.name,
            email: email,
            hashedPassword: hashedPassword,
            otpHash,
            otpAttempts: 0,
            resendCount: 0,
            createdAt: new Date().toISOString(),
            otpExpiresAt: new Date(Date.now() + this._otpTtlSeconds * 1000).toISOString(),
            resendAfter: new Date(Date.now() + this._otpResendCooldownSeconds * 1000).toISOString(),
        }

        await this._pendingSignupRepository.save(pendingSignup, this._otpTtlSeconds,)

        await this._mailerService.sendOtpEmail(email, otp, this._otpTtlSeconds)

        return {
            pendingSignupId,
            maskedEmail: maskEmail(email),
            expiresIn: this._otpTtlSeconds,
            resendAfter: this._otpResendCooldownSeconds
        }
    }

    async verifyOtp(dto: VerifyOtpDto): Promise<AuthResult> {
        const pendingSignup = await this._pendingSignupRepository.findById(dto.pendingSignupId,);

        if (!pendingSignup) {
            throw new BadRequestException("OTP expired or registration not found");
        }

        if (pendingSignup.otpAttempts >= 5) {
            throw new BadRequestException('Too many invalid OTP attempts')
        }

        const isOtpValid = await bcrypt.compare(dto.otp, pendingSignup.otpHash)

        if (!isOtpValid) {
            const ttl = await this._pendingSignupRepository.getTtl(dto.pendingSignupId)

            if (ttl <= 0) {
                throw new BadRequestException('OTP expired or registration not found');
            }

            pendingSignup.otpAttempts += 1
            await this._pendingSignupRepository.save(pendingSignup, ttl)
            throw new BadRequestException('Invalid OTP')
        }

        const existingUser = await this._userRepository.findByEmail(pendingSignup.email)
        if (existingUser) {
            await this._pendingSignupRepository.delete(pendingSignup.id, pendingSignup.email,)
            throw new BadRequestException('User already exists')
        }

        let user;

        try {
            user = await this._userRepository.create({
                name: pendingSignup.name,
                email: pendingSignup.email,
                password: pendingSignup.hashedPassword,
                roles: [UserRole.STUDENT],
                isVerified: true,
                isActive: true
            })
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                await this._pendingSignupRepository.delete(pendingSignup.id, pendingSignup.email,)

                throw new BadRequestException('User already exists');
            }

            throw error;
        }

        await this._pendingSignupRepository.delete(pendingSignup.id, pendingSignup.email,)

        const tokens = await this._generateTokens(user)

        return {
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        }
    }

    async resendOtp(dto: ResendOtpDto) {
        const pendingSignup = await this._pendingSignupRepository.findById(dto.pendingSignupId,);

        if (!pendingSignup) {
            throw new BadRequestException("OTP expired or registration not found");
        }

        const existingUser = await this._userRepository.findByEmail(pendingSignup.email)
        if (existingUser?.isVerified) {
            await this._pendingSignupRepository.delete(pendingSignup.id, pendingSignup.email,)
            throw new BadRequestException('Email already verified')
        }

        if (pendingSignup.resendCount >= 3) {
            throw new BadRequestException('Resend limit reached')
        }

        const resendAfter = new Date(pendingSignup.resendAfter);

        if (!Number.isNaN(resendAfter.getTime()) && resendAfter.getTime() > Date.now()) {
            const retryAfter = Math.ceil((resendAfter.getTime() - Date.now()) / 1000,);

            throw new BadRequestException(`Please wait ${retryAfter} seconds before requesting another OTP`,);
        }

        const otp = generateOtp()
        pendingSignup.otpHash = await bcrypt.hash(otp, 10)
        pendingSignup.otpAttempts = 0
        pendingSignup.resendCount += 1
        pendingSignup.otpExpiresAt = new Date(Date.now() + this._otpTtlSeconds * 1000).toISOString()
        pendingSignup.resendAfter = new Date(Date.now() + this._otpResendCooldownSeconds * 1000).toISOString();

        await this._pendingSignupRepository.save(pendingSignup, this._otpTtlSeconds)

        await this._mailerService.sendOtpEmail(pendingSignup.email, otp, this._otpTtlSeconds)

        return {
            expiresIn: this._otpTtlSeconds,
            resendAfter: this._otpResendCooldownSeconds
        }
    }

    async login(dto: LoginDto): Promise<AuthResult> {
        const email = normalizeEmail(dto.email)

        const authUser = await this._userRepository.findAuthByEmail(email)

        if (!authUser || !authUser?.password) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(dto.password, authUser.password)
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials')
        }

        if (!authUser.isVerified) {
            throw new ForbiddenException('Please verify your email')
        }

        if (!authUser.isActive) {
            throw new ForbiddenException('Account is blocked')
        }

        const safeUser = await this._userRepository.findById(authUser.id)
        if (!safeUser) {
            throw new UnauthorizedException('User not found')
        }

        const tokens = await this._generateTokens(safeUser)

        return {
            user: safeUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        }
    }

    async refresh(refreshToken: string): Promise<RefreshResult> {
        const payload = await this._jwtService.verifyRefreshToken(refreshToken)

        const session = await this._refreshSessionRepository.findById(payload.sessionId)

        if (!session || session.userId !== payload.sub) {
            throw new UnauthorizedException('Refresh session revoked or not found')
        }

        const user = await this._userRepository.findById(payload.sub)

        if (!user) {
            await this._refreshSessionRepository.revoke(payload.sessionId, payload.sub)
            throw new UnauthorizedException('User not found')
        }

        if (!user?.isActive) {
            await this._refreshSessionRepository.revokeAllForUser(user.id)
            throw new ForbiddenException('Account is blocked')
        }

        if (!user?.isVerified) {
            await this._refreshSessionRepository.revokeAllForUser(user.id)
            throw new ForbiddenException('Email is not verified')
        }

        await this._refreshSessionRepository.revoke(payload.sessionId, payload.sub)

        const tokens = await this._generateTokens(user)

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        }
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const email = normalizeEmail(dto.email)

        const user = await this._userRepository.findAuthByEmail(email)

        if (!user || !user.password || !user.isActive || !user.isVerified) {
            return
        }

        const rawToken = this._generatePasswordResetToken()
        const tokenHash = this._hashPasswordResetToken(rawToken)

        await this._passwordResetRepository.create(tokenHash, user.id, this._passwordResetTtlSeconds,)

        const resetLink = `${this._passwordResetUrl}?token=${rawToken}`

        await this._mailerService.sendPasswordResetEmail(
            email,
            resetLink,
            this._passwordResetTtlSeconds
        )
    }

    async validateResetToken(dto: ValidateResetTokenDto) {
        const tokenHash = this._hashPasswordResetToken(dto.token)
        const record = await this._passwordResetRepository.findByTokenHash(tokenHash)

        if (!record) {
            throw new BadRequestException('Reset link is invalid or expired')
        }

        return {
            valid: true
        }
    }

    async resetPassword(dto: ResetPasswordDto) {
        const tokenHash = this._hashPasswordResetToken(dto.token)
        const record = await this._passwordResetRepository.consume(tokenHash)

        if (!record) {
            throw new BadRequestException('Reset link is invalid or expired')
        }

        const user = await this._userRepository.findById(record.userId)

        if (!user) {
            throw new BadRequestException("Reset link is invalid or expired");
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10)

        await this._userRepository.updatePassword(user.id, hashedPassword);
        await this._passwordResetRepository.revokeAllForUser(user.id)
        await this._refreshSessionRepository.revokeAllForUser(user.id);
    }

    async googleSignin(dto: GoogleSignInRequestDto) {
        const googleProfile = await this._googleOAuthService.verifyIdToken(dto.idToken);

        const email = normalizeEmail(googleProfile.email);
        const existingAuthUser = await this._userRepository.findAuthByEmail(email);

        let safeUser;

        if (existingAuthUser) {
            if (!existingAuthUser.isActive) {
                throw new ForbiddenException("Account is blocked");
            }

            safeUser = await this._userRepository.updateGoogleAccount(existingAuthUser.id, {
                googleId: googleProfile.googleId,
                imageUrl: googleProfile.picture ?? null,
                isVerified: true,
            });

            if (!safeUser) {
                throw new UnauthorizedException("User not found");
            }
        } else {
            safeUser = await this._userRepository.create({
                name: googleProfile.name,
                email,
                password: null,
                googleId: googleProfile.googleId,
                imageUrl: googleProfile.picture ?? null,
                roles: [UserRole.STUDENT],
                isVerified: true,
                isActive: true,
            });
        }

        const tokens = await this._generateTokens(safeUser);

        return {
            user: safeUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    async logout(refreshToken?: string) {
        if (refreshToken) {
            const payload = await this._jwtService.verifyRefreshToken(refreshToken)
            await this._refreshSessionRepository.revoke(payload.sessionId, payload.sub)
        }
    }

    async logoutAll(userId: string) {
        await this._refreshSessionRepository.revokeAllForUser(userId)
    }

    async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
        const user = await this._userRepository.findAuthByEmail(
            (await this._userRepository.findById(userId))?.email ?? '',)

        if (!user) {
            throw new UnauthorizedException('User not found')
        }

        if (user.password) {
            if (!dto.currentPassword) {
                throw new BadRequestException('Current password is required')
            }

            const matches = await bcrypt.compare(dto.currentPassword, user.password)

            if (!matches) {
                throw new BadRequestException('Current password is incorrect')
            }
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10)

        await this._userRepository.updatePassword(userId, hashedPassword)
        await this._passwordResetRepository.revokeAllForUser(userId)
        await this._refreshSessionRepository.revokeAllForUser(userId)
    }

    private async _generateTokens(user: { id: string, roles: Role[] }) {
        const sessionId = randomUUID()

        await this._refreshSessionRepository.create(sessionId, user.id, this._refreshTokenTtlSeconds)

        const accessToken = await this._jwtService.signAccessToken({
            sub: user.id,
            roles: user.roles
        })

        const refreshToken = await this._jwtService.signRefreshToken({
            sub: user.id,
            sessionId
        })

        return {
            accessToken,
            refreshToken
        }
    }

    private _generatePasswordResetToken(): string {
        return randomBytes(32).toString("hex");
    }

    private _hashPasswordResetToken(token: string): string {
        return createHash("sha256").update(token).digest("hex");
    }
}