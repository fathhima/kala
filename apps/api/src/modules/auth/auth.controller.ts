import { Body, Controller, Get, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { RegisterDto } from "./dto/request/register.dto";
import { AuthService } from "./services/auth.service";
import { Public } from "@/shared/decorators/public.decorator";
import { MessageResponseDto } from "../../shared/dto/common/message-response.dto";
import { AuthResponseDto } from "./dto/response/auth-response.dto";
import { VerifyOtpDto } from "./dto/request/verify-otp.dto";
import { LoginDto } from "./dto/request/login.dto";
import { MeResponseDto } from "./dto/response/me-response.dto";
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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) { }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register user and send OTP to email' })
    @ApiOkResponse({ type: RegisterResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid data or email already exists' })
    async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
        const result = await this.authService.register(dto)

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
    @ApiOperation({ summary: 'Verify OTP and create account' })
    @ApiOkResponse({ type: AuthResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid OTP or expired registration' })
    async verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponseDto> {
        const result = await this.authService.verifyOtp(dto)
        this.setRefreshCookie(response, result.refreshToken)

        return AuthResponseDto.fromResult({
            message: 'Account verified successfully',
            user: result.user,
            accessToken: result.accessToken
        })
    }

    @Public()
    @Post('resend-otp')
    @ApiOperation({ summary: 'Resend OTP to email' })
    @ApiOkResponse({ type: ResendOtpResponseDto })
    @ApiBadRequestResponse({ description: 'Registration not found or already verified' })
    async resendOtp(@Body() dto: ResendOtpDto): Promise<ResendOtpResponseDto> {
        const result = await this.authService.resendOtp(dto)

        return ResendOtpResponseDto.fromResult({
            message: 'OTP resent successfully',
            expiresIn: result.expiresIn,
            resendAfter: result.resendAfter
        })
    }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiOkResponse({ type: AuthResponseDto })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    @ApiForbiddenResponse({ description: 'Account not verified or blocked' })
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponseDto> {
        const result = await this.authService.login(dto)
        this.setRefreshCookie(response, result.refreshToken)

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
        const refreshToken = this.getRefreshTokenFromCookie(request)

        const result = await this.authService.refresh(refreshToken)

        this.setRefreshCookie(response, result.refreshToken)

        return RefreshResponseDto.fromResult({
            message: 'Token refreshed successfully',
            accessToken: result.accessToken
        })
    }

    @Public()
    @Post("forgot-password")
    @ApiOperation({ summary: "Send password reset link to email" })
    @ApiOkResponse({ type: MessageResponseDto })
    async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<MessageResponseDto> {
        await this.authService.forgotPassword(dto);

        return MessageResponseDto.success(
            'if an account exists, a password reset link has been sent'
        )
    }

    @Public()
    @Post("reset-password/validate")
    @ApiOperation({ summary: "Validate password reset token" })
    @ApiOkResponse({ type: ValidateResetTokenResponseDto })
    async validateResetToken(@Body() dto: ValidateResetTokenDto): Promise<ValidateResetTokenResponseDto> {
        const result = await this.authService.validateResetToken(dto);

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
        await this.authService.resetPassword(dto);

        return MessageResponseDto.success("Password reset successfully")
    }

    @Public()
    @Post("google-signin")
    @ApiOperation({ summary: "Sign in with Google" })
    @ApiOkResponse({ type: AuthResponseDto })
    @ApiUnauthorizedResponse({ description: "Invalid Google token" })
    @ApiForbiddenResponse({ description: "Account is blocked" })
    async googleSignin(@Body() dto: GoogleSignInRequestDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponseDto> {
        const result = await this.authService.googleSignin(dto);
        this.setRefreshCookie(response, result.refreshToken);

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
        const refreshToken = request.cookies?.[this.getCookieName()]
        await this.authService.logout(refreshToken)

        response.clearCookie(this.getCookieName(), this.getCookieOptions())

        return MessageResponseDto.success('Logged out successfully')
    }

    @Post('logout-all')
    @ApiOperation({ summary: 'Logout all sessions of current user' })
    @ApiOkResponse({ type: MessageResponseDto })
    async logoutAll(@UserId() userId: string, @Res({ passthrough: true }) response: Response): Promise<MessageResponseDto> {
        await this.authService.logoutAll(userId)

        response.clearCookie(this.getCookieName(), this.getCookieOptions())

        return MessageResponseDto.success('Logged out from all devices successfully')
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current authenticated user' })
    @ApiOkResponse({ type: MeResponseDto })
    async me(@UserId() userId: string): Promise<MeResponseDto> {
        const user = await this.authService.me(userId)

        return MeResponseDto.fromResult({
            message: 'User fetched successfully',
            user
        })
    }

    private getRefreshTokenFromCookie(request: Request): string {
        const refreshToken = request.cookies?.[this.getCookieName()]

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token cookie is missing')
        }

        return refreshToken
    }

    private setRefreshCookie(response: Response, refreshToken: string) {
        response.cookie(
            this.getCookieName(),
            refreshToken,
            this.getCookieOptions()
        )
    }

    private getCookieName(): string {
        return this.configService.getOrThrow<string>('REFRESH_COOKIE_NAME')
    }

    private getCookieOptions(): CookieOptions {
        const sameSite = this.configService.getOrThrow<"lax" | "strict" | "none">("COOKIE_SAME_SITE");

        const domain = this.configService.get<string>("COOKIE_DOMAIN");

        return {
            httpOnly: true,
            secure: this.configService.getOrThrow<boolean>("COOKIE_SECURE"),
            sameSite,
            domain: domain || undefined,
            path: "/",
            maxAge: this.jwtService.getRefreshTokenTtlSeconds() * 1000,
        };
    }
}