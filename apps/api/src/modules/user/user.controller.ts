import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { ApiBadRequestResponse, ApiConflictResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { Roles } from "@/shared/decorators/roles.decorator";
import { Role } from "@prisma/client";
import { AdminUserResponseDto, AdminUserStatusResponseDto, PaginatedAdminUsersResponseDto } from "./dto/response/user.response.dto";
import { UserQueryDto } from "./dto/request/user-query.dto";
import { UserId } from "@/shared/decorators/user-id.decorator";
import { UpdateUserStatusDto } from "./dto/request/update-user-status.request.dto";

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get paginated users for admin management' })
    @ApiOkResponse({ type: PaginatedAdminUsersResponseDto })
    @ApiUnauthorizedResponse({ description: 'Access token is missing or invalid' })
    @ApiForbiddenResponse({ description: 'Only admins can access this resource' })
    async getAdminUsers(@Query() query: UserQueryDto): Promise<PaginatedAdminUsersResponseDto> {
        const data = await this.userService.getAdminUsers(query)
        return {
            success: true,
            message: 'Users fetched successfully',
            data
        }
    }

    @Patch(':id/status')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Block or unblock a user' })
    @ApiOkResponse({ type: AdminUserStatusResponseDto })
    @ApiUnauthorizedResponse({ description: 'Access token is missing or invalid' })
    @ApiForbiddenResponse({ description: 'Only admins can access this resource' })
    @ApiBadRequestResponse({description: 'Invalid request or admin tried to block their own account',})
    @ApiConflictResponse({ description: 'Admin accounts cannot be blocked' })
    @ApiNotFoundResponse({ description: 'User not found' })
    async updateAdminUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto, @UserId() adminUserId: string,)
        : Promise<AdminUserStatusResponseDto> {
        const data = await this.userService.updateAdminUserStatus(
            id,
            dto,
            adminUserId,
        );

        return {
            success: true,
            message: data.isActive
                ? 'User unblocked successfully'
                : 'User blocked successfully',
            data,
        };
    }

    @Get(':id')
@Roles(Role.ADMIN)
@ApiOperation({ summary: 'Get a single user by id for admin management' })
@ApiOkResponse({ type: AdminUserResponseDto })
@ApiUnauthorizedResponse({ description: 'Access token is missing or invalid' })
@ApiForbiddenResponse({ description: 'Only admins can access this resource' })
@ApiNotFoundResponse({ description: 'User not found' })
async getAdminUserById(@Param('id') id: string): Promise<AdminUserResponseDto> {
  const data = await this.userService.getAdminUserById(id);

  return {
    success: true,
    message: 'User fetched successfully',
    data,
  };
}
}