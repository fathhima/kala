import { Body, Controller, Get, Param, Patch, Query, Inject } from "@nestjs/common";
import { ApiBadRequestResponse, ApiConflictResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse, } from "@nestjs/swagger";
import { Roles } from "@/shared/decorators/roles.decorator";
import { UserId } from "@/shared/decorators/user-id.decorator";
import { UserRole } from "@/shared/enums/role.enum";
import { UserQueryDto } from "@/modules/user/dto/request/user-query.dto";
import { UpdateUserStatusDto } from "@/modules/user/dto/request/update-user-status.request.dto";
import { AdminUserResponseDto } from "@/modules/user/dto/response/admin-user-detail-response.dto";
import { AdminUserStatusResponseDto } from "@/modules/user/dto/response/admin-user-status-response.dto";
import { PaginatedAdminUsersResponseDto } from "@/modules/user/dto/response/admin-paginated-user-list.dto";
import { ADMIN_USER_SERVICE, type IAdminUserService } from "../services/interfaces/admin-user.service.interface";
import { ADMIN_INSTRUCTOR_SERVICE, type IAdminInstructorService } from "../services/interfaces/admin-instructor.service.interface";

@ApiTags("Admin user management")
@Controller("admin")
@Roles(UserRole.ADMIN)
export class AdminUserController {
    constructor(
        @Inject(ADMIN_USER_SERVICE)
        private readonly _adminUserService: IAdminUserService,
    ) { }

    @Get('users')
    @ApiOperation({ summary: "Get paginated users for admin management", })
    @ApiOkResponse({ type: PaginatedAdminUsersResponseDto })
    @ApiUnauthorizedResponse({ description: "Access token is missing or invalid", })
    @ApiForbiddenResponse({ description: "Only admins can access this resource", })
    async getAdminUsers(@Query() query: UserQueryDto,): Promise<PaginatedAdminUsersResponseDto> {
        const result = await this._adminUserService.getUsers(query);

        return PaginatedAdminUsersResponseDto.fromResult({
            message: "Users fetched successfully",
            result,
        });
    }

    @Get("users/:id")
    @ApiOperation({ summary: "Get a single user by id for admin management", })
    @ApiOkResponse({ type: AdminUserResponseDto })
    @ApiUnauthorizedResponse({ description: "Access token is missing or invalid", })
    @ApiForbiddenResponse({ description: "Only admins can access this resource", })
    @ApiNotFoundResponse({ description: "User not found" })
    async getAdminUserById(@Param("id") id: string,): Promise<AdminUserResponseDto> {
        const user = await this._adminUserService.getUserById(id);

        return AdminUserResponseDto.fromResult({
            message: "User fetched successfully",
            user,
        });
    }

    @Patch("users/:id/status")
    @ApiOperation({ summary: "Block or unblock a user", })
    @ApiOkResponse({ type: AdminUserStatusResponseDto })
    @ApiUnauthorizedResponse({ description: "Access token is missing or invalid", })
    @ApiForbiddenResponse({ description: "Only admins can access this resource", })
    @ApiBadRequestResponse({ description: "Invalid request or admin tried to block their own account", })
    @ApiConflictResponse({ description: "Admin accounts cannot be blocked", })
    @ApiNotFoundResponse({ description: "User not found" })
    async updateAdminUserStatus(@Param("id") id: string, @Body() dto: UpdateUserStatusDto, @UserId() adminUserId: string,)
        : Promise<AdminUserStatusResponseDto> {

        const user = await this._adminUserService.updateUserStatus(id, dto, adminUserId,);

        return AdminUserStatusResponseDto.fromResult({
            message: user.isActive
                ? "User unblocked successfully"
                : "User blocked successfully",
            user,
        });
    }
}