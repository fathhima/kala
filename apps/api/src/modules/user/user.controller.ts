import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { CategoryListResponseDto } from "../category/dto/response/category-response.dto";

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
}