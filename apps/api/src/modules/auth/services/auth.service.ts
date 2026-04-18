import { BadRequestException, Inject, Injectable } from "@nestjs/common";
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

@Injectable()
export class AuthService {
    private readonly otpTilSeconds: number;

    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        private readonly redisService: RedisService,
        private readonly mailerService: MailerService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {
        this.otpTilSeconds = this.configService.getOrThrow<number>('OTP_TIL_SECONDS')
    }

    async register(dto: RegisterDto) {

        const email = this.normalizeEmail(dto.email);

        const existingUser = await this.userRepository.findByEmail(email)

        if (existingUser?.isVerified) {
            throw new BadRequestException('Email already registered')
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10)

        const otp = this.generateOtp()

        const pendingSignup: PendingSignup = {
            name: dto.name,
            email: email,
            hashedPassword: hashedPassword,
            otp: otp
        }

        await this.redisService.set(this.signupKey(email), JSON.stringify(pendingSignup), this.otpTilSeconds)

        await this.mailerService.sendOtpEmail(email, otp)

        return {
            success: true,
            message: 'OTP sent successfully'
        }
    }

    async verifyOtp(dto: VerifyOtpDto) {

        const email = this.normalizeEmail(dto.email);

        const rawPendingSignup = await this.redisService.get(this.signupKey(email))

        if (!rawPendingSignup) {
            throw new BadRequestException('OTP expired or registration not found')
        }

        const pendingSignup = JSON.parse(rawPendingSignup) as PendingSignup

        if (pendingSignup.otp !== dto.otp) {
            throw new BadRequestException('Invalid OTP')
        }

        const existingUser = await this.userRepository.findByEmail(email)

        if (existingUser) {
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

        await this.redisService.del(this.signupKey(email))

        const tokens = await this.generateTokens(user)

        return {
            success: true,
            message: 'Login successfull',
            data: {
                user,
                ...tokens
            }
        }
    }

    private normalizeEmail(email: string): string {
        return email.trim().toLowerCase();
    }

    private generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString()
    }

    private signupKey(email: string) {
        return `auth:signup:${email}`
    }

    private async generateTokens(user: {
        id: string,
        email: string,
        roles: Role[]
    }) {
        const payload = {
            sub: user.id,
            email: user.email,
            roles: user.roles
        }

        return {
            accessToken: await this.jwtService.signAccessToken(payload),
            refreshToken: await this.jwtService.signRefreshToken(payload)
        }
    }
}