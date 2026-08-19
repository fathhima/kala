import { Body, Controller, Get, Patch } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { CategoryListResponseDto } from "../category/dto/response/category-response.dto";
import { UserId } from "@/shared/decorators/user-id.decorator";
import { MeResponseDto } from "../auth/dto/response/me-response.dto";
import { UpdateUserProfileDto } from "./dto/request/update-user-profile.request.dto";

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('categories')
    @ApiOperation({ summary: 'Get selectable categories and subcategories', })
    @ApiOkResponse({ type: CategoryListResponseDto, })
    async findSelectable(): Promise<CategoryListResponseDto> {
        const categories = await this.userService.findSelectable()

        return CategoryListResponseDto.fromEntities('Selectable categories fetched successfully', categories,)
    }

    @Patch('me')
    @ApiOperation({ summary: 'Update the current user profile' })
    @ApiOkResponse({ type: MeResponseDto })
    async updateMe(@UserId() userId: string, @Body() dto: UpdateUserProfileDto,): Promise<MeResponseDto> {
        const user = await this.userService.updateMyProfile(userId, dto)

        return MeResponseDto.fromResult({
            message: 'Profile updated successfully',
            user,
        })
    }
}