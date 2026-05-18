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
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto)
    }

    @Public()
    @Post('verify-otp')
    @ApiOperation({ summary: 'Verify OTP and create account' })
    @ApiOkResponse({ type: AuthResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid OTP or expired registration' })
    async verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) response: Response) {
        const result = await this.authService.verifyOtp(dto)
        this.setRefreshCookie(response, result.refreshToken)

        return {
            success: result.success,
            message: result.message,
            data: result.data
        }
    }

    @Public()
    @Post('resend-otp')
    @ApiOperation({ summary: 'Resend OTP to email' })
    @ApiOkResponse({ type: ResendOtpResponseDto })
    @ApiBadRequestResponse({ description: 'Registration not found or already verified' })
    resendOtp(@Body() dto: ResendOtpDto) {
        return this.authService.resendOtp(dto)
    }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiOkResponse({ type: AuthResponseDto })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    @ApiForbiddenResponse({ description: 'Account not verified or blocked' })
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
        const result = await this.authService.login(dto)
        this.setRefreshCookie(response, result.refreshToken)

        return {
            success: result.success,
            message: result.message,
            data: result.data
        }
    }

    @Public()
    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token using refresh cookie' })
    async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refreshToken = this.getRefreshTokenFromCookie(request)
        const result = await this.authService.refresh(refreshToken)

        this.setRefreshCookie(response, result.refreshToken)

        return {
            success: result.success,
            message: result.message,
            data: result.data
        }
    }

    @Public()
    @Post("forgot-password")
    @ApiOperation({ summary: "Send password reset link to email" })
    @ApiOkResponse({ type: MessageResponseDto })
    forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    @Public()
    @Post("reset-password/validate")
    @ApiOperation({ summary: "Validate password reset token" })
    validateResetToken(@Body() dto: ValidateResetTokenDto) {
        return this.authService.validateResetToken(dto);
    }

    @Public()
    @Post("reset-password")
    @ApiOperation({ summary: "Reset password using reset token" })
    @ApiOkResponse({ type: MessageResponseDto })
    resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }

    @Public()
    @Post("google-signin")
    @ApiOperation({ summary: "Sign in with Google" })
    @ApiOkResponse({ type: AuthResponseDto })
    @ApiUnauthorizedResponse({ description: "Invalid Google token" })
    @ApiForbiddenResponse({ description: "Account is blocked" })
    async googleSignin(@Body() dto: GoogleSignInRequestDto, @Res({ passthrough: true }) response: Response,) {
        const result = await this.authService.googleSignin(dto);
        this.setRefreshCookie(response, result.refreshToken);

        return {
            success: result.success,
            message: result.message,
            data: result.data,
        };
    }

    @Post('logout')
    @ApiOperation({ summary: 'logout current session' })
    async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refreshToken = request.cookies?.[this.getCookieName()]
        const result = await this.authService.logout(refreshToken)

        response.clearCookie(this.getCookieName(), this.getCookieOptions())

        return result
    }

    @Post('logout-all')
    @ApiOperation({ summary: 'Logout all sessions of current user' })
    async logoutAll(@UserId() userId: string, @Res({ passthrough: true }) response: Response) {
        const result = await this.authService.logoutAll(userId)

        response.clearCookie(this.getCookieName(), this.getCookieOptions())

        return result
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current authenticated user' })
    @ApiOkResponse({ type: MeResponseDto })
    me(@UserId() userId: string) {
        return this.authService.me(userId)
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
        const sameSite = this.configService.getOrThrow<
            "lax" | "strict" | "none"
        >("COOKIE_SAME_SITE");

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