import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { ApiBadRequestResponse, ApiConflictResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { Roles } from "@/shared/decorators/roles.decorator";
import { UserQueryDto } from "./dto/request/user-query.dto";
import { UserId } from "@/shared/decorators/user-id.decorator";
import { UpdateUserStatusDto } from "./dto/request/update-user-status.request.dto";
import { AdminUserResponseDto } from "./dto/response/admin-user-detail-response.dto";
import { AdminUserStatusResponseDto } from "./dto/response/admin-user-status-response.dto";
import { PaginatedAdminUsersResponseDto } from "./dto/response/admin-paginated-user-list.dto";
import { UserRole } from "@/shared/enums/role.enum";

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get paginated users for admin management' })
    @ApiOkResponse({ type: PaginatedAdminUsersResponseDto })
    @ApiUnauthorizedResponse({ description: 'Access token is missing or invalid' })
    @ApiForbiddenResponse({ description: 'Only admins can access this resource' })
    async getAdminUsers(@Query() query: UserQueryDto): Promise<PaginatedAdminUsersResponseDto> {
        const result = await this.userService.getAdminUsers(query)

        return PaginatedAdminUsersResponseDto.fromResult({
            message: 'Users fetched successfully',
            result
        })

    }

    @Patch(':id/status')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Block or unblock a user' })
    @ApiOkResponse({ type: AdminUserStatusResponseDto })
    @ApiUnauthorizedResponse({ description: 'Access token is missing or invalid' })
    @ApiForbiddenResponse({ description: 'Only admins can access this resource' })
    @ApiBadRequestResponse({ description: 'Invalid request or admin tried to block their own account', })
    @ApiConflictResponse({ description: 'Admin accounts cannot be blocked' })
    @ApiNotFoundResponse({ description: 'User not found' })
    async updateAdminUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto, @UserId() adminUserId: string,)
        : Promise<AdminUserStatusResponseDto> {
        const user = await this.userService.updateAdminUserStatus(
            id,
            dto,
            adminUserId,
        );

        return AdminUserStatusResponseDto.fromResult({
            message: user.isActive
                ? 'User unblocked successfully'
                : 'User blocked successfully',
            user,
        })
    }

    @Get(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get a single user by id for admin management' })
    @ApiOkResponse({ type: AdminUserResponseDto })
    @ApiUnauthorizedResponse({ description: 'Access token is missing or invalid' })
    @ApiForbiddenResponse({ description: 'Only admins can access this resource' })
    @ApiNotFoundResponse({ description: 'User not found' })
    async getAdminUserById(@Param('id') id: string): Promise<AdminUserResponseDto> {
        const user = await this.userService.getAdminUserById(id);

        return AdminUserResponseDto.fromResult({
            message: 'User fetched successfully',
            user
        })
    }
}