import { BadRequestException, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { RegisterDto } from "../dto/request/register.dto";
import { USER_REPOSITORY } from "@/modules/user/repositories/interfaces/user.repository";
import type { UserRepository } from "@/modules/user/repositories/interfaces/user.repository";
import * as bcrypt from 'bcrypt'
import { PendingSignup } from "../types/pending-signup.type";
import { RedisService } from "@/shared/redis/redis.service";
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
import { GoogleOAuthService } from "./google-oauth.service";
import { GoogleSignInRequestDto } from "../dto/request/google-signin.dto";
import { AuthResult, RefreshResult } from "../types/auth-result.type";
import { UserRole } from "@/shared/enums/role.enum";

@Injectable()
export class AuthService {
    private readonly otpTtlSeconds: number;
    private readonly otpResendCooldownSeconds: number;
    private readonly refreshTokenTtlSeconds: number;
    private readonly passwordResetTtlSeconds: number;
    private readonly passwordResetUrl: string;

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        private readonly redisService: RedisService,
        private readonly mailerService: MailerService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly googleOAuthService: GoogleOAuthService

    ) {
        this.otpTtlSeconds = this.configService.getOrThrow<number>('OTP_TTL_SECONDS')
        this.refreshTokenTtlSeconds = this.jwtService.getRefreshTokenTtlSeconds()
        this.passwordResetTtlSeconds =
            this.configService.getOrThrow<number>("PASSWORD_RESET_TTL_SECONDS");
        this.passwordResetUrl =
            this.configService.getOrThrow<string>("PASSWORD_RESET_URL");
        this.otpResendCooldownSeconds = this.configService.getOrThrow<number>("OTP_RESEND_COOLDOWN_SECONDS");
    }

    async register(dto: RegisterDto) {
        const email = normalizeEmail(dto.email);

        const existingUser = await this.userRepository.findByEmail(email)
        if (existingUser?.isVerified) {
            throw new BadRequestException('Email already registered')
        }

        const existingPendingId = await this.redisService.getPendingSignupIdByEmail(email)
        if (existingPendingId) {
            await this.redisService.deletePendingSignup(existingPendingId)
            await this.redisService.deletePendingSignupEmailIndex(email)
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
            otpExpiresAt: new Date(Date.now() + this.otpTtlSeconds * 1000).toISOString(),
            resendAfter: new Date(Date.now() + this.otpResendCooldownSeconds * 1000).toISOString(),
        }

        await this.redisService.setPendingSignup(pendingSignupId, JSON.stringify(pendingSignup), this.otpTtlSeconds)
        await this.redisService.setPendingSignupEmailIndex(email, pendingSignupId, this.otpTtlSeconds)

        await this.mailerService.sendOtpEmail(email, otp, this.otpTtlSeconds)

        return {
            pendingSignupId,
            maskedEmail: maskEmail(email),
            expiresIn: this.otpTtlSeconds,
            resendAfter: this.otpResendCooldownSeconds
        }
    }

    async verifyOtp(dto: VerifyOtpDto): Promise<AuthResult> {
        const rawPendingSignup = await this.redisService.getPendingSignup(dto.pendingSignupId)

        if (!rawPendingSignup) {
            throw new BadRequestException('OTP expired or registration not found')
        }

        const pendingSignup = JSON.parse(rawPendingSignup) as PendingSignup

        if (pendingSignup.otpAttempts >= 5) {
            throw new BadRequestException('Too many invalid OTP attempts')
        }

        const isOtpValid = await bcrypt.compare(dto.otp, pendingSignup.otpHash)

        if (!isOtpValid) {
            const ttl = await this.redisService.getPendingSignupTtl(dto.pendingSignupId);

            if (ttl <= 0) {
                throw new BadRequestException('OTP expired or registration not found');
            }

            pendingSignup.otpAttempts += 1
            await this.redisService.setPendingSignup(pendingSignup.id, JSON.stringify(pendingSignup), ttl)
            throw new BadRequestException('Invalid OTP')
        }

        const existingUser = await this.userRepository.findByEmail(pendingSignup.email)
        if (existingUser) {
            await this.redisService.deletePendingSignup(pendingSignup.id)
            await this.redisService.deletePendingSignupEmailIndex(pendingSignup.email)
            throw new BadRequestException('User already exists')
        }

        let user;

        try {
            user = await this.userRepository.create({
                name: pendingSignup.name,
                email: pendingSignup.email,
                password: pendingSignup.hashedPassword,
                roles: [UserRole.STUDENT],
                isVerified: true,
                isActive: true
            })
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                await this.redisService.deletePendingSignup(pendingSignup.id);
                await this.redisService.deletePendingSignupEmailIndex(pendingSignup.email,);

                throw new BadRequestException('User already exists');
            }

            throw error;
        }



        await this.redisService.deletePendingSignup(pendingSignup.id)
        await this.redisService.deletePendingSignupEmailIndex(pendingSignup.email)

        const tokens = await this.generateTokens(user)

        return {
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        }
    }

    async resendOtp(dto: ResendOtpDto) {
        const rawPendingSignup = await this.redisService.getPendingSignup(dto.pendingSignupId)
        if (!rawPendingSignup) {
            throw new BadRequestException('Registration not found or OTP expired')
        }

        const pendingSignup = JSON.parse(rawPendingSignup) as PendingSignup

        const existingUser = await this.userRepository.findByEmail(pendingSignup.email)
        if (existingUser?.isVerified) {
            await this.redisService.deletePendingSignup(pendingSignup.id)
            await this.redisService.deletePendingSignupEmailIndex(pendingSignup.email)
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
        pendingSignup.otpExpiresAt = new Date(Date.now() + this.otpTtlSeconds * 1000).toISOString()
        pendingSignup.resendAfter = new Date(Date.now() + this.otpResendCooldownSeconds * 1000).toISOString();

        await this.redisService.setPendingSignup(pendingSignup.id, JSON.stringify(pendingSignup), this.otpTtlSeconds)
        await this.redisService.setPendingSignupEmailIndex(pendingSignup.email, pendingSignup.id, this.otpTtlSeconds)

        await this.mailerService.sendOtpEmail(pendingSignup.email, otp, this.otpTtlSeconds)

        return {
            expiresIn: this.otpTtlSeconds,
            resendAfter: this.otpResendCooldownSeconds
        }
    }

    async login(dto: LoginDto): Promise<AuthResult> {
        const email = normalizeEmail(dto.email)

        const authUser = await this.userRepository.findAuthByEmail(email)

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

        const safeUser = await this.userRepository.findById(authUser.id)
        if (!safeUser) {
            throw new UnauthorizedException('User not found')
        }

        const tokens = await this.generateTokens(safeUser)

        return {
            user: safeUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        }
    }

    async refresh(refreshToken: string): Promise<RefreshResult> {
        const payload = await this.jwtService.verifyRefreshToken(refreshToken)

        const session = await this.redisService.getRefreshSession(payload.sessionId)

        if (!session || session.userId !== payload.sub) {
            throw new UnauthorizedException('Refresh session revoked or not found')
        }

        const user = await this.userRepository.findById(payload.sub)

        if (!user) {
            await this.redisService.deleteRefreshSession(payload.sessionId, payload.sub)
            throw new UnauthorizedException('User not found')
        }

        if (!user?.isActive) {
            await this.redisService.deleteAllUserRefreshSessions(user.id)
            throw new ForbiddenException('Account is blocked')
        }

        if (!user?.isVerified) {
            await this.redisService.deleteAllUserRefreshSessions(user.id)
            throw new ForbiddenException('Email is not verified')
        }

        await this.redisService.deleteRefreshSession(payload.sessionId, payload.sub)

        const tokens = await this.generateTokens(user)

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        }
    }

    async me(userId: string) {

        const user = await this.userRepository.findById(userId)

        if (!user) {
            throw new UnauthorizedException('User not found')
        }

        return user

    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const email = normalizeEmail(dto.email)

        const user = await this.userRepository.findAuthByEmail(email)

        if (!user || !user.password || !user.isActive || !user.isVerified) {
            return
        }

        const rawToken = this.generatePasswordResetToken()
        const tokenHash = this.hashPasswordResetToken(rawToken)

        await this.redisService.setPasswordResetToken(tokenHash, user.id, this.passwordResetTtlSeconds)

        const resetLink = `${this.passwordResetUrl}?token=${rawToken}`

        await this.mailerService.sendPasswordResetEmail(
            email,
            resetLink,
            this.passwordResetTtlSeconds
        )
    }

    async validateResetToken(dto: ValidateResetTokenDto) {
        const tokenHash = this.hashPasswordResetToken(dto.token)
        const record = await this.redisService.getPasswordResetToken(tokenHash)

        if (!record) {
            throw new BadRequestException('Reset link is invalid or expired')
        }

        return {
            valid: true
        }
    }

    async resetPassword(dto: ResetPasswordDto) {
        const tokenHash = this.hashPasswordResetToken(dto.token)
        const record = await this.redisService.consumePasswordResetToken(tokenHash)

        if (!record) {
            throw new BadRequestException('Reset link is invalid or expired')
        }

        const user = await this.userRepository.findById(record.userId)

        if (!user) {
            throw new BadRequestException("Reset link is invalid or expired");
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10)

        await this.userRepository.updatePassword(user.id, hashedPassword);
        await this.redisService.deleteAllUserPasswordResetTokens(user.id);
        await this.redisService.deleteAllUserRefreshSessions(user.id);
    }

    async googleSignin(dto: GoogleSignInRequestDto) {
        const googleProfile = await this.googleOAuthService.verifyIdToken(dto.idToken);

        const email = normalizeEmail(googleProfile.email);
        const existingAuthUser = await this.userRepository.findAuthByEmail(email);

        let safeUser;

        if (existingAuthUser) {
            if (!existingAuthUser.isActive) {
                throw new ForbiddenException("Account is blocked");
            }

            if (existingAuthUser.googleId !== googleProfile.googleId) {
                safeUser = await this.userRepository.updateGoogleAccount(existingAuthUser.id, {
                    googleId: googleProfile.googleId,
                    imageUrl: googleProfile.picture ?? null,
                    isVerified: true,
                });
            } else {
                safeUser = await this.userRepository.findById(existingAuthUser.id);
            }

            if (!safeUser) {
                throw new UnauthorizedException("User not found");
            }
        } else {
            safeUser = await this.userRepository.create({
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

        const tokens = await this.generateTokens(safeUser);

        return {
            user: safeUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    async logout(refreshToken?: string) {
        if (refreshToken) {
            const payload = await this.jwtService.verifyRefreshToken(refreshToken)
            await this.redisService.deleteRefreshSession(payload.sessionId, payload.sub)
        }
    }

    async logoutAll(userId: string) {
        await this.redisService.deleteAllUserRefreshSessions(userId)
    }

    private async generateTokens(user: {
        id: string,
        roles: Role[]
    }) {
        const sessionId = randomUUID()

        await this.redisService.setRefreshSession(sessionId, user.id, this.refreshTokenTtlSeconds)

        const accessToken = await this.jwtService.signAccessToken({
            sub: user.id,
            roles: user.roles
        })

        const refreshToken = await this.jwtService.signRefreshToken({
            sub: user.id,
            sessionId
        })

        return {
            accessToken,
            refreshToken
        }
    }

    private generatePasswordResetToken(): string {
        return randomBytes(32).toString("hex");
    }

    private hashPasswordResetToken(token: string): string {
        return createHash("sha256").update(token).digest("hex");
    }
}