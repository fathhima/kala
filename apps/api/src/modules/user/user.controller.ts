import { Body, Controller, Get, Inject, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserId } from "@/shared/decorators/user-id.decorator";
import { MeResponseDto } from "./dto/response/me-response.dto";
import { UpdateUserProfileDto } from "./dto/request/update-user-profile.request.dto";
import { USER_SERVICE, type IUserService } from "./services/interfaces/user.service.interface";

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        @Inject(USER_SERVICE)
        private readonly _userService: IUserService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get the current user profile' })
    @ApiOkResponse({ type: MeResponseDto })
    async getMe(@UserId() userId: string): Promise<MeResponseDto> {
        const user = await this._userService.getMyProfile(userId);

        return MeResponseDto.fromResult({
            message: 'User fetched successfully',
            user,
        });
    }

    @Patch('me')
    @ApiOperation({ summary: 'Update the current user profile' })
    @ApiOkResponse({ type: MeResponseDto })
    async updateMe(@UserId() userId: string, @Body() dto: UpdateUserProfileDto,): Promise<MeResponseDto> {
        const user = await this._userService.updateMyProfile(userId, dto)

        return MeResponseDto.fromResult({
            message: 'Profile updated successfully',
            user,
        })
    }
}