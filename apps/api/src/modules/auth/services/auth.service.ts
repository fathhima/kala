import { BadRequestException, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { RegisterDto } from "../dto/request/register.dto";
import { USER_REPOSITORY } from "@/modules/user/repositories/interfaces/user.repository";
import type { UserRepository } from "@/modules/user/repositories/interfaces/user.repository";
import * as bcrypt from 'bcrypt'
import { PendingSignup } from "../types/pending-signup.type";
import { RedisService } from "@/shared/redis/redis.service";
import { MailerService } from "@/shared/mailer/mailer.service";
import { VerifyOtpDto } from "../dto/request/verify-otp.dto";
import { Role } from "@prisma/client";
import { JwtService } from "@/shared/jwt/jwt.service";
import { ConfigService } from "@nestjs/config";
import { LoginDto } from "../dto/request/login.dto";
import { generateOtp } from "../utils/generate-otp";
import { normalizeEmail } from "../utils/normalize-email";
import { ResendOtpDto } from "../dto/request/resend-otp.dto";
import { randomUUID } from "crypto";
import { maskEmail } from "../utils/masked-email";

@Injectable()
export class AuthService {
    private readonly otpTtlSeconds: number;
    private readonly refreshTokenTtlSeconds: number;

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        private readonly redisService: RedisService,
        private readonly mailerService: MailerService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {
        this.otpTtlSeconds = this.configService.getOrThrow<number>('OTP_TTL_SECONDS')
        this.refreshTokenTtlSeconds = this.jwtService.getRefreshTokenTtlSeconds()
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
            otpExpiresAt: new Date(Date.now() + this.otpTtlSeconds * 1000).toISOString()
        }

        await this.redisService.setPendingSignup(pendingSignupId, JSON.stringify(pendingSignup), this.otpTtlSeconds)
        await this.redisService.setPendingSignupEmailIndex(email, pendingSignupId, this.otpTtlSeconds)

        await this.mailerService.sendOtpEmail(email, otp, this.otpTtlSeconds)

        return {
            success: true,
            message: 'OTP sent successfully',
            data: {
                pendingSignupId,
                maskedEmail: maskEmail(email),
                expiresIn: this.otpTtlSeconds
            }
        }
    }

    async verifyOtp(dto: VerifyOtpDto) {
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

        const user = await this.userRepository.create({
            name: pendingSignup.name,
            email: pendingSignup.email,
            password: pendingSignup.hashedPassword,
            roles: [Role.STUDENT],
            isVerified: true,
            isActive: true
        })

        await this.redisService.deletePendingSignup(pendingSignup.id)
        await this.redisService.deletePendingSignupEmailIndex(pendingSignup.email)

        const tokens = await this.generateTokens(user)

        return {
            success: true,
            message: 'Login successfull',
            data: {
                user,
                accessToken: tokens.accessToken
            },
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
            throw new BadRequestException('Resend limit raeched')
        }

        const otp = generateOtp()
        pendingSignup.otpHash = await bcrypt.hash(otp, 10)
        pendingSignup.otpAttempts = 0
        pendingSignup.resendCount += 1
        pendingSignup.otpExpiresAt = new Date(Date.now() + this.otpTtlSeconds * 1000).toISOString()

        await this.redisService.setPendingSignup(pendingSignup.id, JSON.stringify(pendingSignup), this.otpTtlSeconds)
        await this.redisService.setPendingSignupEmailIndex(pendingSignup.email, pendingSignup.id, this.otpTtlSeconds)

        await this.mailerService.sendOtpEmail(pendingSignup.email, otp)

        return {
            success: true,
            message: 'OTP resent successfully',
            data: {
                expiresIn: this.otpTtlSeconds
            }
        }
    }

    async login(dto: LoginDto) {
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
            success: true,
            message: 'Login successful',
            data: {
                user: safeUser,
                accessToken: tokens.accessToken
            },
            refreshToken: tokens.refreshToken
        }
    }

    async refresh(refreshToken: string) {
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
            success: true,
            message: "Token refreshed successfully",
            data: {
                accessToken: tokens.accessToken
            },
            refreshToken: tokens.refreshToken,
        };
    }

    async me(userId: string) {

        const user = await this.userRepository.findById(userId)

        if (!user) {
            throw new UnauthorizedException('User not found')
        }

        return {
            success: true,
            message: 'User fetched successfully',
            data: user
        }
    }

    async logout(refreshToken?: string) {
        if (refreshToken) {
            try {
                const payload = await this.jwtService.verifyRefreshToken(refreshToken)
                await this.redisService.deleteRefreshSession(payload.sessionId, payload.sub)
            } catch {
            }
        }
        return {
            success: true,
            message: 'Logged out successfully'
        }
    }

    async logoutAll(userId: string) {
        await this.redisService.deleteAllUserRefreshSessions(userId)

        return {
            success: true,
            message: 'Logged out from all devices successfully'
        }
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
}