import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { PendingSignup } from '../types/pending-signup.type';
import { ConfigService } from '@nestjs/config';
import { generateOtp } from '../utils/generate-otp';
import { normalizeEmail } from '../utils/normalize-email';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { maskEmail } from '../utils/masked-email';
import { AuthResult, RefreshResult } from '../types/auth-result.type';
import { UserRole } from '@/shared/enums/role.enum';
import { REFRESH_SESSION_REPOSITORY } from '../repositories/interfaces/refresh-session.interface';
import type { IRefreshSessionRepository } from '../repositories/interfaces/refresh-session.interface';
import {
    PENDING_SIGNUP_REPOSITORY,
    type IPendingSignupRepository,
} from '../repositories/interfaces/pending-signup.interface';
import {
    PASSWORD_RESET_REPOSITORY,
    type IPasswordResetRepository,
} from '../repositories/interfaces/password-reset.interface';
import { IAuthService } from './interfaces/auth.service.interface';
import {
    GOOGLE_OAUTH_PROVIDER,
    type IGoogleOAuthProvider,
} from './interfaces/google-oauth.interface';
import {
    ChangePasswordInput,
    ForgotPasswordInput,
    GoogleSignInInput,
    LoginInput,
    RegisterInput,
    ResendOtpInput,
    ResetPasswordInput,
    ValidateResetTokenInput,
    VerifyOtpInput,
} from '../types/auth.type';
import {
    MAILER_SERVICE,
    type IMailerService,
} from '@/shared/mailer/repositories/interfaces/mailer.interface';
import {
    type IJwtService,
    JWT_SERVICE,
} from '@/shared/jwt/repositories/interfaces/token.interface';
import {
    type IUserIdentityService,
    USER_IDENTITY_SERVICE,
} from '@/modules/user/services/interfaces/user-identity.service.interface';
import {
    type IPasswordHasher,
    PASSWORD_HASHER,
} from './interfaces/password-hasher.interface';

@Injectable()
export class AuthService implements IAuthService {
    private readonly _otpTtlSeconds: number;
    private readonly _otpResendCooldownSeconds: number;
    private readonly _refreshTokenTtlSeconds: number;
    private readonly _passwordResetTtlSeconds: number;
    private readonly _passwordResetUrl: string;

    constructor(
        @Inject(USER_IDENTITY_SERVICE)
        private readonly _userIdentityService: IUserIdentityService,
        @Inject(REFRESH_SESSION_REPOSITORY)
        private readonly _refreshSessionRepository: IRefreshSessionRepository,
        @Inject(PENDING_SIGNUP_REPOSITORY)
        private readonly _pendingSignupRepository: IPendingSignupRepository,
        @Inject(PASSWORD_RESET_REPOSITORY)
        private readonly _passwordResetRepository: IPasswordResetRepository,
        @Inject(GOOGLE_OAUTH_PROVIDER)
        private readonly _googleOAuthProvider: IGoogleOAuthProvider,
        @Inject(MAILER_SERVICE)
        private readonly _mailerService: IMailerService,
        @Inject(JWT_SERVICE)
        private readonly _jwtService: IJwtService,
        @Inject(PASSWORD_HASHER)
        private readonly _passwordHasher: IPasswordHasher,
        private readonly _configService: ConfigService,
    ) {
        this._otpTtlSeconds =
            this._configService.getOrThrow<number>('OTP_TTL_SECONDS');
        this._refreshTokenTtlSeconds = this._jwtService.getRefreshTokenTtlSeconds();
        this._passwordResetTtlSeconds = this._configService.getOrThrow<number>(
            'PASSWORD_RESET_TTL_SECONDS',
        );
        this._passwordResetUrl =
            this._configService.getOrThrow<string>('PASSWORD_RESET_URL');
        this._otpResendCooldownSeconds = this._configService.getOrThrow<number>(
            'OTP_RESEND_COOLDOWN_SECONDS',
        );
    }

    async register(input: RegisterInput) {
        const email = normalizeEmail(input.email);

        const existingUser = await this._userIdentityService.findByEmail(email);
        if (existingUser?.isVerified) {
            throw new BadRequestException('Email already registered');
        }

        const existingPendingId =
            await this._pendingSignupRepository.findIdByEmail(email);
        if (existingPendingId) {
            await this._pendingSignupRepository.delete(existingPendingId, email);
        }

        const hashedPassword = await this._passwordHasher.hash(input.password);
        const otp = generateOtp();
        const otpHash = await this._passwordHasher.hash(otp);
        const pendingSignupId = randomUUID();

        const pendingSignup: PendingSignup = {
            id: pendingSignupId,
            name: input.name,
            email: email,
            hashedPassword: hashedPassword,
            otpHash,
            otpAttempts: 0,
            resendCount: 0,
            createdAt: new Date().toISOString(),
            otpExpiresAt: new Date(
                Date.now() + this._otpTtlSeconds * 1000,
            ).toISOString(),
            resendAfter: new Date(
                Date.now() + this._otpResendCooldownSeconds * 1000,
            ).toISOString(),
        };

        await this._pendingSignupRepository.save(
            pendingSignup,
            this._otpTtlSeconds,
        );

        await this._mailerService.sendOtpEmail(email, otp, this._otpTtlSeconds);

        return {
            pendingSignupId,
            maskedEmail: maskEmail(email),
            expiresIn: this._otpTtlSeconds,
            resendAfter: this._otpResendCooldownSeconds,
        };
    }

    async verifyOtp(input: VerifyOtpInput): Promise<AuthResult> {
        const pendingSignup = await this._pendingSignupRepository.findById(
            input.pendingSignupId,
        );

        if (!pendingSignup) {
            throw new BadRequestException('OTP expired or registration not found');
        }

        if (pendingSignup.otpAttempts >= 5) {
            throw new BadRequestException('Too many invalid OTP attempts');
        }

        const isOtpValid = await this._passwordHasher.compare(
            input.otp,
            pendingSignup.otpHash,
        );

        if (!isOtpValid) {
            const ttl = await this._pendingSignupRepository.getTtl(
                input.pendingSignupId,
            );

            if (ttl <= 0) {
                throw new BadRequestException('OTP expired or registration not found');
            }

            pendingSignup.otpAttempts += 1;
            await this._pendingSignupRepository.save(pendingSignup, ttl);
            throw new BadRequestException('Invalid OTP');
        }

        const existingUser = await this._userIdentityService.findByEmail(
            pendingSignup.email,
        );
        if (existingUser) {
            await this._pendingSignupRepository.delete(
                pendingSignup.id,
                pendingSignup.email,
            );
            throw new BadRequestException('User already exists');
        }

        let user;

        user = await this._userIdentityService.create({
            name: pendingSignup.name,
            email: pendingSignup.email,
            password: pendingSignup.hashedPassword,
            roles: [UserRole.STUDENT],
            isVerified: true,
            isActive: true,
        });

        await this._pendingSignupRepository.delete(
            pendingSignup.id,
            pendingSignup.email,
        );

        const tokens = await this._generateTokens(user);

        return {
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    async resendOtp(input: ResendOtpInput) {
        const pendingSignup = await this._pendingSignupRepository.findById(
            input.pendingSignupId,
        );

        if (!pendingSignup) {
            throw new BadRequestException('OTP expired or registration not found');
        }

        const existingUser = await this._userIdentityService.findByEmail(
            pendingSignup.email,
        );
        if (existingUser?.isVerified) {
            await this._pendingSignupRepository.delete(
                pendingSignup.id,
                pendingSignup.email,
            );
            throw new BadRequestException('Email already verified');
        }

        if (pendingSignup.resendCount >= 3) {
            throw new BadRequestException('Resend limit reached');
        }

        const resendAfter = new Date(pendingSignup.resendAfter);

        if (
            !Number.isNaN(resendAfter.getTime()) &&
            resendAfter.getTime() > Date.now()
        ) {
            const retryAfter = Math.ceil((resendAfter.getTime() - Date.now()) / 1000);

            throw new BadRequestException(
                `Please wait ${retryAfter} seconds before requesting another OTP`,
            );
        }

        const otp = generateOtp();
        pendingSignup.otpHash = await this._passwordHasher.hash(otp);
        pendingSignup.otpAttempts = 0;
        pendingSignup.resendCount += 1;
        pendingSignup.otpExpiresAt = new Date(
            Date.now() + this._otpTtlSeconds * 1000,
        ).toISOString();
        pendingSignup.resendAfter = new Date(
            Date.now() + this._otpResendCooldownSeconds * 1000,
        ).toISOString();

        await this._pendingSignupRepository.save(
            pendingSignup,
            this._otpTtlSeconds,
        );

        await this._mailerService.sendOtpEmail(
            pendingSignup.email,
            otp,
            this._otpTtlSeconds,
        );

        return {
            expiresIn: this._otpTtlSeconds,
            resendAfter: this._otpResendCooldownSeconds,
        };
    }

    async login(input: LoginInput): Promise<AuthResult> {
        const email = normalizeEmail(input.email);

        const authUser = await this._userIdentityService.findAuthByEmail(email);

        if (!authUser || !authUser?.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await this._passwordHasher.compare(
            input.password,
            authUser.password,
        );
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!authUser.isVerified) {
            throw new ForbiddenException('Please verify your email');
        }

        if (!authUser.isActive) {
            throw new ForbiddenException('Account is blocked');
        }

        const { password, ...safeUser } = authUser;

        const tokens = await this._generateTokens(safeUser);

        return {
            user: safeUser,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    async refresh(refreshToken: string): Promise<RefreshResult> {
        const payload = await this._jwtService.verifyRefreshToken(refreshToken);

        const session = await this._refreshSessionRepository.findById(
            payload.sessionId,
        );

        if (!session || session.userId !== payload.sub) {
            throw new UnauthorizedException('Refresh session revoked or not found');
        }

        const user = await this._userIdentityService.findById(payload.sub);

        if (!user) {
            await this._refreshSessionRepository.revoke(
                payload.sessionId,
                payload.sub,
            );
            throw new UnauthorizedException('User not found');
        }

        if (!user?.isActive) {
            await this._refreshSessionRepository.revokeAllForUser(user.id);
            throw new ForbiddenException('Account is blocked');
        }

        if (!user?.isVerified) {
            await this._refreshSessionRepository.revokeAllForUser(user.id);
            throw new ForbiddenException('Email is not verified');
        }

        await this._refreshSessionRepository.revoke(payload.sessionId, payload.sub);

        const tokens = await this._generateTokens(user);

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }

    async forgotPassword(input: ForgotPasswordInput) {
        const email = normalizeEmail(input.email);

        const user = await this._userIdentityService.findAuthByEmail(email);

        if (!user || !user.password || !user.isActive || !user.isVerified) {
            return;
        }

        const rawToken = this._generatePasswordResetToken();
        const tokenHash = this._hashPasswordResetToken(rawToken);

        await this._passwordResetRepository.create(
            tokenHash,
            user.id,
            this._passwordResetTtlSeconds,
        );

        const resetLink = `${this._passwordResetUrl}?token=${rawToken}`;

        await this._mailerService.sendPasswordResetEmail(
            email,
            resetLink,
            this._passwordResetTtlSeconds,
        );
    }

    async validateResetToken(input: ValidateResetTokenInput) {
        const tokenHash = this._hashPasswordResetToken(input.token);
        const record =
            await this._passwordResetRepository.findByTokenHash(tokenHash);

        if (!record) {
            throw new BadRequestException('Reset link is invalid or expired');
        }

        return {
            valid: true,
        };
    }

    async resetPassword(input: ResetPasswordInput) {
        const tokenHash = this._hashPasswordResetToken(input.token);
        const record = await this._passwordResetRepository.consume(tokenHash);

        if (!record) {
            throw new BadRequestException('Reset link is invalid or expired');
        }

        const user = await this._userIdentityService.findById(record.userId);

        if (!user) {
            throw new BadRequestException('Reset link is invalid or expired');
        }

        const hashedPassword = await this._passwordHasher.hash(input.newPassword);

        await this._userIdentityService.updatePassword(user.id, hashedPassword);
        await this._passwordResetRepository.revokeAllForUser(user.id);
        await this._refreshSessionRepository.revokeAllForUser(user.id);
    }

    async googleSignin(input: GoogleSignInInput) {
        const googleProfile = await this._googleOAuthProvider.verifyIdToken(
            input.idToken,
        );

        const email = normalizeEmail(googleProfile.email);
        const existingAuthUser =
            await this._userIdentityService.findAuthByEmail(email);

        let safeUser;

        if (existingAuthUser) {
            if (!existingAuthUser.isActive) {
                throw new ForbiddenException('Account is blocked');
            }

            safeUser = await this._userIdentityService.updateGoogleAccount(
                existingAuthUser.id,
                {
                    googleId: googleProfile.googleId,
                    imageUrl: googleProfile.picture ?? null,
                    isVerified: true,
                },
            );

            if (!safeUser) {
                throw new UnauthorizedException('User not found');
            }
        } else {
            safeUser = await this._userIdentityService.create({
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
            const payload = await this._jwtService.verifyRefreshToken(refreshToken);
            await this._refreshSessionRepository.revoke(
                payload.sessionId,
                payload.sub,
            );
        }
    }

    async logoutAll(userId: string) {
        await this._refreshSessionRepository.revokeAllForUser(userId);
    }

    async changePassword(userId: string, input: ChangePasswordInput,): Promise<void> {
        const user = await this._userIdentityService.findAuthById(userId);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (user.password) {
            if (!input.currentPassword) {
                throw new BadRequestException('Current password is required');
            }

            const matches = await this._passwordHasher.compare(
                input.currentPassword,
                user.password,
            );

            if (!matches) {
                throw new BadRequestException('Current password is incorrect');
            }
        }

        const hashedPassword = await this._passwordHasher.hash(input.newPassword);

        await this._userIdentityService.updatePassword(userId, hashedPassword);
        await this._passwordResetRepository.revokeAllForUser(userId);
        await this._refreshSessionRepository.revokeAllForUser(userId);
    }

    async revokeAllSessions(userId: string): Promise<void> {
        return this._refreshSessionRepository.revokeAllForUser(userId);
    }

    private async _generateTokens(user: { id: string; roles: UserRole[] }) {
        const sessionId = randomUUID();

        await this._refreshSessionRepository.create(
            sessionId,
            user.id,
            this._refreshTokenTtlSeconds,
        );

        const accessToken = await this._jwtService.signAccessToken({
            sub: user.id,
            roles: user.roles,
        });

        const refreshToken = await this._jwtService.signRefreshToken({
            sub: user.id,
            sessionId,
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    private _generatePasswordResetToken(): string {
        return randomBytes(32).toString('hex');
    }

    private _hashPasswordResetToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }
}
