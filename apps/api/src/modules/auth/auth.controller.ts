import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, Req, BadRequestException } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { ResendOtpDto } from "./dto/resend-otp.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { AuthService } from "./services/auth.service";
import { MessageOnlyHttpResponse } from "@/shared/types";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UpdatePasswordDto } from "./dto/request/update-password.request.dto";
import { GoogleSignInRequestDto } from "./dto/request/google-signin.request.dto";
import { RefreshTokenRequestDto } from "./dto/request/refresh-token.request.dto";
import type { Response } from "express";
import { HttpResponse } from "@/shared/dto/common/http-response.dto";
import { UserId } from "@/shared/decorators/user-id.decorator";
import { Public } from "@/shared/decorators/public.decorator";
import { ApiResponseWithType } from "@/shared/decorators/api-responsewithtype.decorator";
import { MeResponseDto } from "./dto/response/me-response.dto";

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    @ApiResponseWithType({},MeResponseDto)
    @ApiOperation({ summary: 'Get current user details' })
    async me(@UserId() userId: string): Promise<HttpResponse<MeResponseDto>> {
        const user = await this.authService.me(userId);
        return {
            message: "User details retrieved successfully",
            data: user
        };
    }

    @Post('login')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: MessageOnlyHttpResponse })
    @ApiOperation({ summary: 'User login' })
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response): Promise<MessageOnlyHttpResponse> {
        const { accessToken, refreshToken } = await this.authService.login(body)
        this.setAuthCookies(res, accessToken, refreshToken)
        return {
            message: "user login success"
        }
    }

    @Post('login/admin')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: MessageOnlyHttpResponse })
    @ApiOperation({ summary: 'Admin login' })
    async adminLogin(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response): Promise<MessageOnlyHttpResponse> {
        const { accessToken, refreshToken } = await this.authService.login(body)
        this.setAuthCookies(res, accessToken, refreshToken)
        return {
            message: "admin login success"
        }
    }


    @Post('register')
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse({ type: MessageOnlyHttpResponse })
    @ApiOperation({ summary: 'User register' })
    async register(@Body() body: RegisterDto): Promise<MessageOnlyHttpResponse> {
        const data = await this.authService.register(body)
        console.log(data)
        return {
            message: "user registered successfully",
        }
    }

    @Post('verify-otp')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: MessageOnlyHttpResponse })
    @ApiOperation({ summary: 'Verify registration OTP' })
    async verifyOtp(@Body() body: VerifyOtpDto): Promise<MessageOnlyHttpResponse> {
        return this.authService.verifyOtp(body)
    }

    @Post('resend-otp')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: MessageOnlyHttpResponse })
    @ApiOperation({ summary: 'Resend registration OTP' })
    async resendOtp(@Body() body: ResendOtpDto): Promise<MessageOnlyHttpResponse> {
        return this.authService.resendOtp(body)
    }

    @Post('forgot-password')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: MessageOnlyHttpResponse })
    @ApiOperation({ summary: 'Send password reset OTP' })
    forgotPassword(@Body() body: ForgotPasswordDto): Promise<MessageOnlyHttpResponse> {
        return this.authService.forgotPassword(body)
    }

    @Post('reset-password')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: MessageOnlyHttpResponse })
    @ApiOperation({ summary: 'Reset password with OTP' })
    resetPassword(@Body() body: ResetPasswordDto): Promise<MessageOnlyHttpResponse> {
        return this.authService.resetPassword(body)
    }

    @Post('update-password')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: MessageOnlyHttpResponse })
    @ApiOperation({ summary: 'Update password for authenticated user' })
    updatePassword(@UserId() userId: string, @Body() body: UpdatePasswordDto): Promise<MessageOnlyHttpResponse> {
        return this.authService.updatePassword(userId, body)
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response): MessageOnlyHttpResponse {
        this.clearAuthCookies(res)
        return {
            message: "user logged out successfully"
        }
    }

    @Post('google/sign-in')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: MessageOnlyHttpResponse })
    @ApiOperation({ summary: 'Google OAuth sign-in/sign-up' })
    async googleSignIn(@Body() body: GoogleSignInRequestDto, @Res({ passthrough: true }) res: Response): Promise<MessageOnlyHttpResponse> {
        const { accessToken, refreshToken } = await this.authService.googleSignIn(body.idToken)
        this.setAuthCookies(res, accessToken, refreshToken)
        return {
            message: "google sign-in success"
        }
    }

    @Post('refresh')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: MessageOnlyHttpResponse })
    @ApiOperation({ summary: 'Refresh access token using refresh token' })
    async refreshToken(@Req() req: any, @Body() body: RefreshTokenRequestDto = {}, @Res({ passthrough: true }) res: Response): Promise<MessageOnlyHttpResponse> {
        // Get refresh token from request body or cookies
        const refreshToken = body?.refreshToken || req.cookies?.['refresh_token']
        
        if (!refreshToken) {
            throw new BadRequestException('Refresh token not provided')
        }

        const { accessToken } = await this.authService.refreshAccessToken(refreshToken)
        const isProduction = process.env.NODE_ENV === 'production'
        
        // Update access token cookie
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 15 * 60 * 1000,
        })

        return {
            message: "access token refreshed successfully"
        }
    }

    // Helper methods
    private setAuthCookies(
        res: Response,
        accessToken: string,
        refreshToken: string,
    ): void {
        const isProduction = process.env.NODE_ENV === 'production'

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }

    private clearAuthCookies(res: Response): void {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
    }
}