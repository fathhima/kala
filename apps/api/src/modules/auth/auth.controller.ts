import { Body, Controller, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { RegisterDto } from "./dto/request/register.dto";
import { AuthService } from "./services/auth.service";
import { Public } from "@/shared/decorators/public.decorator";
import { MessageResponseDto } from "../../shared/dto/common/message-response.dto";
import { AuthResponseDto } from "./dto/response/auth-response.dto";
import { VerifyOtpDto } from "./dto/request/verify-otp.dto";

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

}