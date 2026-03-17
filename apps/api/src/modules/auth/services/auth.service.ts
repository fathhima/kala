import { ConflictException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common"
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

type StoredOtpPayload = {
    hashedOtp: string
    purpose: 'register'
}

@Injectable()
export class AuthService {
    private static readonly OTP_KEY_PREFIX = 'auth:otp:register:'
    private static readonly REFRESH_TOKEN_KEY_PREFIX = 'auth:refresh:'
    private static readonly REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60

    constructor(
        @Inject('UserService')
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) { }


    async me(userId: string) {
        const user = await this.userService.findById(userId)
        return user
    }

    async login(data: LoginDto) {

        const user = await this.userService.findByEmail(data.email)

        if (!user) {
            throw new UnauthorizedException("Invalid credentials")
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

        if(!user.roles.includes(UserRole.ADMIN)) {
            throw new UnauthorizedException("You do not have admin access")
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

    private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)
        const refreshTokenKey = this.buildRefreshTokenKey(userId)

        await this.redisService.set(refreshTokenKey, hashedRefreshToken, AuthService.REFRESH_TOKEN_TTL_SECONDS)
    }

    private buildOtpKey(email: string): string {
        return `${AuthService.OTP_KEY_PREFIX}${email.toLowerCase()}`
    }

    private buildRefreshTokenKey(userId: string): string {
        return `${AuthService.REFRESH_TOKEN_KEY_PREFIX}${userId}`
    }

    private generateOtpCode(): string {
        return randomInt(100000, 1000000).toString()
    }
}