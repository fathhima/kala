import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { LoginDto } from "../dto/login.dto"
import { RegisterDto } from "../dto/register.dto"
import { VerifyOtpDto } from "../dto/verify-otp.dto"
import { ResendOtpDto } from "../dto/resend-otp.dto"
import * as bcrypt from 'bcrypt'
import { randomInt } from "crypto"
import { UserService } from "../../user/services/user.service"
import { JwtService } from "../../../shared/jwt/jwt.service"
import { UserRole } from "@/modules/user/entities/user.entity"
import { MessageOnlyHttpResponse } from "@/shared/types"
import { RedisService } from "@/shared/redis/redis.service"
import { MailerService } from "@/shared/mailer/mailer.service"
import { ForgotPasswordDto } from "../dto/forgot-password.dto"
import { ResetPasswordDto } from "../dto/reset-password.dto"
import { UpdatePasswordDto } from "../dto/request/update-password.request.dto"
import { GoogleOAuthService } from "./google-oauth.service"

type StoredOtpPayload = {
    hashedOtp: string
    purpose: 'register' | 'password-reset'
}

@Injectable()
export class AuthService {
    private static readonly OTP_KEY_PREFIX = 'auth:otp:register:'
    private static readonly PASSWORD_RESET_OTP_KEY_PREFIX = 'auth:otp:password-reset:'
    private static readonly REFRESH_TOKEN_KEY_PREFIX = 'auth:refresh:'

    constructor(
        @Inject('UserService')
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
        private readonly googleOAuthService: GoogleOAuthService,
    ) { }


    async me(userId: string) {
        const user = await this.userService.findById(userId)
        if (!user) throw new NotFoundException('User not found');
        return user
    }

    async login(data: LoginDto) {

        const user = await this.userService.findByEmail(data.email)

        if (!user) {
            throw new UnauthorizedException("Invalid credentials")
        }

        if (!user.password) {
            throw new UnauthorizedException("Please sign in with Google")
        }

        const isMatch = await bcrypt.compare(data.password, user.password)

        if (!isMatch) {
            throw new UnauthorizedException("Invalid credentials")
        }

        if (!user.isVerified) {
            throw new UnauthorizedException('Please verify your email before logging in')
        }

        const payload = {
            sub: user.id,
            role: user.roles,
        }

        const accessToken = this.jwtService.generateAccessToken(payload)
        const refreshToken = this.jwtService.generateRefreshToken(payload)

        await this.storeRefreshToken(user.id, refreshToken)

        return {
            accessToken,
            refreshToken
        }
    }

    async adminLogin(data: LoginDto) {

        const user = await this.userService.findByEmail(data.email)

        if (!user) {
            throw new UnauthorizedException("Invalid credentials")
        }

        if (!user.roles.includes(UserRole.ADMIN)) {
            throw new UnauthorizedException("You do not have admin access")
        }

        if (!user.password) {
            throw new UnauthorizedException("Please sign in with Google")
        }

        const isMatch = await bcrypt.compare(data.password, user.password)

        if (!isMatch) {
            throw new UnauthorizedException("Invalid credentials")
        }

        if (!user.isVerified) {
            throw new UnauthorizedException('Please verify your email before logging in')
        }

        const payload = {
            sub: user.id,
            role: user.roles,
        }

        const accessToken = this.jwtService.generateAccessToken(payload)
        const refreshToken = this.jwtService.generateRefreshToken(payload)

        await this.storeRefreshToken(user.id, refreshToken)

        return {
            accessToken,
            refreshToken
        }
    }


    async register(data: RegisterDto) {
        const existingUser = await this.userService.findByEmail(data.email)

        if (existingUser) {
            throw new ConflictException('Email already exists')
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)

        await this.userService.create({
            ...data,
            password: hashedPassword,
            roles: [UserRole.STUDENT]
        })

        const user = await this.userService.findByEmail(data.email)

        if (!user) {
            throw new InternalServerErrorException('error creating user, try again later')
        }

        await this.sendRegistrationOtp(user.email)
    }

    async verifyOtp(data: VerifyOtpDto): Promise<MessageOnlyHttpResponse> {
        const user = await this.userService.findByEmail(data.email)

        if (!user) {
            throw new UnauthorizedException('Invalid OTP request')
        }

        const otpKey = this.buildOtpKey(data.email)
        const otpPayload = await this.redisService.getJson<StoredOtpPayload>(otpKey)

        if (!otpPayload) {
            throw new UnauthorizedException('OTP expired or not found')
        }

        const isOtpValid = await bcrypt.compare(data.otp, otpPayload.hashedOtp)

        if (!isOtpValid) {
            throw new UnauthorizedException('Invalid OTP')
        }

        await this.userService.update(user.id, { isVerified: true })
        await this.redisService.del(otpKey)

        return {
            message: 'email verified successfully',
        }
    }

    async resendOtp(data: ResendOtpDto): Promise<MessageOnlyHttpResponse> {
        const user = await this.userService.findByEmail(data.email)

        if (!user) {
            throw new UnauthorizedException('Invalid OTP request')
        }

        if (user.isVerified) {
            throw new ConflictException('Email is already verified')
        }

        await this.sendRegistrationOtp(user.email)

        return {
            message: 'otp resent successfully'
        }
    }

    async forgotPassword(data: ForgotPasswordDto): Promise<MessageOnlyHttpResponse> {
        const user = await this.userService.findByEmail(data.email)

        if (!user) {
            return {
                message: 'If the email exists, an OTP has been sent successfully',
            }
        }

        await this.sendPasswordResetOtp(user.email)

        return {
            message: 'If the email exists, an OTP has been sent successfully',
        }
    }

    async resetPassword(data: ResetPasswordDto): Promise<MessageOnlyHttpResponse> {
        if (data.newPassword !== data.confirmPassword) {
            throw new BadRequestException('Passwords do not match')
        }

        const user = await this.userService.findByEmail(data.email)

        if (!user) {
            throw new UnauthorizedException('Invalid password reset request')
        }

        const otpKey = this.buildPasswordResetOtpKey(data.email)
        const otpPayload = await this.redisService.getJson<StoredOtpPayload>(otpKey)

        if (!otpPayload || otpPayload.purpose !== 'password-reset') {
            throw new UnauthorizedException('OTP expired or not found')
        }

        const isOtpValid = await bcrypt.compare(data.otp, otpPayload.hashedOtp)

        if (!isOtpValid) {
            throw new UnauthorizedException('Invalid OTP')
        }

        const hashedPassword = await bcrypt.hash(data.newPassword, 10)

        await this.userService.update(user.id, { password: hashedPassword })
        await this.redisService.del(otpKey)

        return {
            message: 'password reset successfully',
        }
    }

    async updatePassword(userId: string, data: UpdatePasswordDto): Promise<MessageOnlyHttpResponse> {
        const user = await this.userService.findEntityById(userId)

        if (!user) {
            throw new UnauthorizedException('User not found')
        }

        if (!user.password) {
            throw new BadRequestException('Password is not set for this account')
        }

        const isCurrentPasswordValid = await bcrypt.compare(data.password, user.password)

        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect')
        }

        const isSamePassword = await bcrypt.compare(data.newPassword, user.password)

        if (isSamePassword) {
            throw new BadRequestException('New password must be different from current password')
        }

        const hashedPassword = await bcrypt.hash(data.newPassword, 10)

        await this.userService.update(user.id, { password: hashedPassword })
        await this.redisService.del(this.buildRefreshTokenKey(user.id))

        return {
            message: 'password updated successfully',
        }
    }

    logout() {
        return {
            message: 'logout success'
        }
    }

    private async sendRegistrationOtp(email: string): Promise<void> {
        const otp = this.generateOtpCode()
        const hashedOtp = await bcrypt.hash(otp, 10)
        const otpTtlSeconds = this.configService.get<number>('OTP_TTL_SECONDS') ?? 600
        const otpKey = this.buildOtpKey(email)

        await this.redisService.setJson(
            otpKey,
            {
                hashedOtp,
                purpose: 'register',
            },
            otpTtlSeconds,
        )

        console.log(`Generated OTP for ${email}: ${otp}`)

        await this.mailerService.sendOtpEmail(email, otp)
    }

    private async sendPasswordResetOtp(email: string): Promise<void> {
        const otp = this.generateOtpCode()
        const hashedOtp = await bcrypt.hash(otp, 10)
        const otpTtlSeconds = this.configService.get<number>('OTP_TTL_SECONDS') ?? 600
        const otpKey = this.buildPasswordResetOtpKey(email)

        await this.redisService.setJson(
            otpKey,
            {
                hashedOtp,
                purpose: 'password-reset',
            },
            otpTtlSeconds,
        )

        console.log(`Generated password reset OTP for ${email}: ${otp}`)

        await this.mailerService.sendOtpEmail(email, otp)
    }

    private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)
        const refreshTokenKey = this.buildRefreshTokenKey(userId)

        const ttl = this.configService.get<number>('REFRESH_TOKEN_TTL_SECONDS');

        await this.redisService.set(refreshTokenKey, hashedRefreshToken, ttl)
    }

    private buildOtpKey(email: string): string {
        return `${AuthService.OTP_KEY_PREFIX}${email.toLowerCase()}`
    }

    private buildPasswordResetOtpKey(email: string): string {
        return `${AuthService.PASSWORD_RESET_OTP_KEY_PREFIX}${email.toLowerCase()}`
    }

    private buildRefreshTokenKey(userId: string): string {
        return `${AuthService.REFRESH_TOKEN_KEY_PREFIX}${userId}`
    }

    private generateOtpCode(): string {
        return randomInt(100000, 1000000).toString()
    }

    async googleSignIn(idToken: string) {
        // Verify Google ID token
        const googleProfile = await this.googleOAuthService.verifyIdToken(idToken)

        let user = await this.userService.findByEmail(googleProfile.email)

        if (!user) {
            // Create new user with Google profile
            const tempPassword = Math.random().toString(36).slice(-10) // Temporary random password
            await this.userService.create({
                name: googleProfile.name,
                email: googleProfile.email,
                password: tempPassword,
                roles: [UserRole.STUDENT], // Default role for new social users
            })

            // Fetch newly created user
            user = await this.userService.findByEmail(googleProfile.email)

            if (!user) {
                throw new Error('Failed to create user')
            }

            // Update user with Google-specific fields
            await this.userService.update(user.id, {
                googleId: googleProfile.sub,
                isVerified: true,
                imageUrl: googleProfile.picture,
                password: null,
            })
        } else if (!user.googleId) {
            // Auto-link existing email account
            await this.userService.update(user.id, {
                googleId: googleProfile.sub,
                isVerified: true,
                imageUrl: googleProfile.picture || user.imageUrl,
            })
        }

        // Refresh user data to get updated info
        const finalUser = await this.userService.findEntityById(user.id)
        if (!finalUser) {
            throw new NotFoundException('User not found after creation')
        }

        // Generate tokens
        const payload = {
            sub: finalUser.id,
            role: finalUser.roles,
        }

        const accessToken = this.jwtService.generateAccessToken(payload)
        const refreshToken = this.jwtService.generateRefreshToken(payload)

        await this.storeRefreshToken(finalUser.id, refreshToken)

        return {
            accessToken,
            refreshToken,
        }
    }

    async refreshAccessToken(refreshToken: string) {
        try {
            // Verify refresh token signature
            const payload = this.jwtService.verifyRefreshToken(refreshToken)

            if (typeof payload === 'string' || !payload.sub) {
                throw new UnauthorizedException('Invalid refresh token payload')
            }

            const userId = payload.sub

            // Check if refresh token exists in Redis and matches
            const refreshTokenKey = this.buildRefreshTokenKey(userId)
            const storedHashedToken = await this.redisService.get(refreshTokenKey)

            if (!storedHashedToken) {
                throw new UnauthorizedException('Refresh token not found or expired')
            }

            const isTokenValid = await bcrypt.compare(refreshToken, storedHashedToken)

            if (!isTokenValid) {
                throw new UnauthorizedException('Invalid refresh token')
            }

            // Get user to verify still active
            const user = await this.userService.findById(userId)

            if (!user || !user.isActive) {
                throw new UnauthorizedException('User not found or inactive')
            }

            // Generate new access token (and optionally rotate refresh token)
            const newPayload = {
                sub: user.id,
                role: user.roles,
            }

            const newAccessToken = this.jwtService.generateAccessToken(newPayload)

            // Optional: Rotate refresh token (more secure but more complex)
            // For now, we'll reuse the same refresh token
            // const newRefreshToken = this.jwtService.generateRefreshToken(newPayload)
            // await this.storeRefreshToken(user.id, newRefreshToken)

            return {
                accessToken: newAccessToken,
                // refreshToken: newRefreshToken, // Only if rotating
            }
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error
            }
            throw new UnauthorizedException('Failed to refresh token')
        }
    }
}