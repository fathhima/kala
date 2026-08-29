import { Body, Controller, Post, Put, Req, Res, UnauthorizedException, Inject } from "@nestjs/common";
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { RegisterDto } from "./dto/request/register.dto";
import { Public } from "@/shared/decorators/public.decorator";
import { MessageResponseDto } from "../../shared/dto/response/message-response.dto";
import { AuthResponseDto } from "./dto/response/auth-response.dto";
import { VerifyOtpDto } from "./dto/request/verify-otp.dto";
import { LoginDto } from "./dto/request/login.dto";
import { UserId } from "@/shared/decorators/user-id.decorator";
import { ResendOtpDto } from "./dto/request/resend-otp.dto";
import type { CookieOptions, Request, Response } from "express";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@/shared/jwt/jwt.service";
import { RegisterResponseDto } from "./dto/response/register-response.dto";
import { ResendOtpResponseDto } from "./dto/response/resend-otp-response.dto";
import { ForgotPasswordDto } from "./dto/request/forgot-password.dto";
import { ValidateResetTokenDto } from "./dto/request/validate-reset-token.dto";
import { ResetPasswordDto } from "./dto/request/reset-password.dto";
import { GoogleSignInRequestDto } from "./dto/request/google-signin.dto";
import { RefreshResponseDto } from "./dto/response/refresh-response.dto";
import { ValidateResetTokenResponseDto } from "./dto/response/validate-reset-token-response.dto";
import { Throttle } from "@nestjs/throttler";
import { ChangePasswordDto } from "./dto/request/change-password.dto";
import { AUTH_SERVICE, type IAuthService } from "./services/interfaces/auth.service.interface";

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(
        @Inject(AUTH_SERVICE)
        private _authService: IAuthService,
        private readonly _configService: ConfigService,
        private readonly _jwtService: JwtService
    ) { }

    @Public()
    @Post('register')
    @Throttle({ default: { limit: 3, ttl: 60_000 } })
    @ApiOperation({ summary: 'Register user and send OTP to email' })
    @ApiOkResponse({ type: RegisterResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid data or email already exists' })
    async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
        const result = await this._authService.register(dto)

        return RegisterResponseDto.fromResult({
            message: 'OTP sent successfully',
            pendingSignupId: result.pendingSignupId,
            maskedEmail: result.maskedEmail,
            expiresIn: result.expiresIn,
            resendAfter: result.resendAfter
        })
    }

    @Public()
    @Post('verify-otp')
    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @ApiOperation({ summary: 'Verify OTP and create account' })
    @ApiOkResponse({ type: AuthResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid OTP or expired registration' })
    async verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponseDto> {
        const result = await this._authService.verifyOtp(dto)
        this._setRefreshCookie(response, result.refreshToken)

        return AuthResponseDto.fromResult({
            message: 'Account verified successfully',
            user: result.user,
            accessToken: result.accessToken
        })
    }

    @Public()
    @Post('resend-otp')
    @Throttle({ default: { limit: 3, ttl: 60_000 } })
    @ApiOperation({ summary: 'Resend OTP to email' })
    @ApiOkResponse({ type: ResendOtpResponseDto })
    @ApiBadRequestResponse({ description: 'Registration not found or already verified' })
    async resendOtp(@Body() dto: ResendOtpDto): Promise<ResendOtpResponseDto> {
        const result = await this._authService.resendOtp(dto)

        return ResendOtpResponseDto.fromResult({
            message: 'OTP resent successfully',
            expiresIn: result.expiresIn,
            resendAfter: result.resendAfter
        })
    }

    @Public()
    @Post('login')
    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiOkResponse({ type: AuthResponseDto })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    @ApiForbiddenResponse({ description: 'Account not verified or blocked' })
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponseDto> {
        const result = await this._authService.login(dto)
        this._setRefreshCookie(response, result.refreshToken)

        return AuthResponseDto.fromResult({
            message: 'Login successfull',
            user: result.user,
            accessToken: result.accessToken
        })
    }

    @Public()
    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token using refresh cookie' })
    @ApiOkResponse({ type: RefreshResponseDto })
    async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<RefreshResponseDto> {
        const refreshToken = this._getRefreshTokenFromCookie(request)

        const result = await this._authService.refresh(refreshToken)

        this._setRefreshCookie(response, result.refreshToken)

        return RefreshResponseDto.fromResult({
            message: 'Token refreshed successfully',
            accessToken: result.accessToken
        })
    }

    @Public()
    @Post("forgot-password")
    @Throttle({ default: { limit: 3, ttl: 60_000 } })
    @ApiOperation({ summary: "Send password reset link to email" })
    @ApiOkResponse({ type: MessageResponseDto })
    async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<MessageResponseDto> {
        await this._authService.forgotPassword(dto);

        return MessageResponseDto.success(
            'if an account exists, a password reset link has been sent'
        )
    }

    @Public()
    @Post("reset-password/validate")
    @ApiOperation({ summary: "Validate password reset token" })
    @ApiOkResponse({ type: ValidateResetTokenResponseDto })
    async validateResetToken(@Body() dto: ValidateResetTokenDto): Promise<ValidateResetTokenResponseDto> {
        const result = await this._authService.validateResetToken(dto);

        return ValidateResetTokenResponseDto.fromResult({
            message: 'Reset link is valid',
            valid: result.valid
        })
    }

    @Public()
    @Post("reset-password")
    @ApiOperation({ summary: "Reset password using reset token" })
    @ApiOkResponse({ type: MessageResponseDto })
    async resetPassword(@Body() dto: ResetPasswordDto): Promise<MessageResponseDto> {
        await this._authService.resetPassword(dto);

        return MessageResponseDto.success("Password reset successfully")
    }

    @Public()
    @Post("google-signin")
    @ApiOperation({ summary: "Sign in with Google" })
    @ApiOkResponse({ type: AuthResponseDto })
    @ApiUnauthorizedResponse({ description: "Invalid Google token" })
    @ApiForbiddenResponse({ description: "Account is blocked" })
    async googleSignin(@Body() dto: GoogleSignInRequestDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponseDto> {
        const result = await this._authService.googleSignin(dto);
        this._setRefreshCookie(response, result.refreshToken);

        return AuthResponseDto.fromResult({
            message: 'Google sign-in successfull',
            user: result.user,
            accessToken: result.accessToken
        })
    }

    @Post('logout')
    @ApiOperation({ summary: 'logout current session' })
    @ApiOkResponse({ type: MessageResponseDto })
    async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<MessageResponseDto> {
        const refreshToken = request.cookies?.[this._getCookieName()]
        await this._authService.logout(refreshToken)

        response.clearCookie(this._getCookieName(), this._getCookieOptions())

        return MessageResponseDto.success('Logged out successfully')
    }

    @Post('logout-all')
    @ApiOperation({ summary: 'Logout all sessions of current user' })
    @ApiOkResponse({ type: MessageResponseDto })
    async logoutAll(@UserId() userId: string, @Res({ passthrough: true }) response: Response): Promise<MessageResponseDto> {
        await this._authService.logoutAll(userId)

        response.clearCookie(this._getCookieName(), this._getCookieOptions())

        return MessageResponseDto.success('Logged out from all devices successfully')
    }

    @Put('password')
    @ApiOperation({ summary: 'Set or change the current account password', })
    @ApiOkResponse({ type: MessageResponseDto })
    async changePassword(@UserId() userId: string, @Body() dto: ChangePasswordDto,): Promise<MessageResponseDto> {
        await this._authService.changePassword(userId, dto)

        return MessageResponseDto.success('Password updated. Please sign in again.',)
    }

    private _getRefreshTokenFromCookie(request: Request): string {
        const refreshToken = request.cookies?.[this._getCookieName()]

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token cookie is missing')
        }

        return refreshToken
    }

    private _setRefreshCookie(response: Response, refreshToken: string) {
        response.cookie(
            this._getCookieName(),
            refreshToken,
            this._getCookieOptions()
        )
    }

    private _getCookieName(): string {
        return this._configService.getOrThrow<string>('REFRESH_COOKIE_NAME')
    }

    private _getCookieOptions(): CookieOptions {
        const sameSite = this._configService.getOrThrow<"lax" | "strict" | "none">("COOKIE_SAME_SITE");

        const domain = this._configService.get<string>("COOKIE_DOMAIN");

        return {
            httpOnly: true,
            secure: this._configService.getOrThrow<boolean>("COOKIE_SECURE"),
            sameSite,
            domain: domain || undefined,
            path: "/",
            maxAge: this._jwtService.getRefreshTokenTtlSeconds() * 1000,
        };
    }
}