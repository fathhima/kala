import { Body, Controller, Get, Post } from "@nestjs/common";
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

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register user and send OTP to email' })
    @ApiOkResponse({ type: MessageResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid data or email already exists' })
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto)
    }

    @Public()
    @Post('verify-otp')
    @ApiOperation({ summary: 'Verify OTP and create account' })
    @ApiOkResponse({ type: AuthResponseDto })
    @ApiBadRequestResponse({ description: 'Invalid OTP or expired registration' })
    verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.authService.verifyOtp(dto)
    }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiOkResponse({ type: AuthResponseDto })
    @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
    @ApiForbiddenResponse({ description: 'Account not verified or blocked' })
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto)
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current authenticated user' })
    @ApiOkResponse({ type: MeResponseDto })
    me(@UserId() userId: string) {
        return this.authService.me(userId)
    }

}