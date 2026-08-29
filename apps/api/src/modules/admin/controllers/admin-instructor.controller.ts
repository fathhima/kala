import { Body, Controller, Get, Param, Patch, Query, Inject } from '@nestjs/common';
import { ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse, } from '@nestjs/swagger';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserId } from '@/shared/decorators/user-id.decorator';
import { UserRole } from '@/shared/enums/role.enum';
import { InstructorApplicationQueryDto } from '@/modules/instructor/dto/request/instructor-application-query.dto';
import { ReviewOfferingDto } from '@/modules/instructor/dto/request/review-offering.dto';
import { InstructorApplicationResponseDto, PaginatedInstructorApplicationsResponseDto, PresignedDownloadResponseDto, } from '@/modules/instructor/dto/response/instructor-response.dto';
import { ADMIN_INSTRUCTOR_SERVICE, type IAdminInstructorService } from "../services/interfaces/admin-instructor.service.interface";

@ApiTags('Admin instructor management')
@Controller('admin/instructor-applications')
@Roles(UserRole.ADMIN)
export class AdminInstructorController {
    constructor(
        @Inject(ADMIN_INSTRUCTOR_SERVICE)
        private readonly _adminInstructorService: IAdminInstructorService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'List instructor applications for admin review', })
    @ApiOkResponse({ type: PaginatedInstructorApplicationsResponseDto, })
    @ApiUnauthorizedResponse({ description: 'Access token is missing or invalid', })
    @ApiForbiddenResponse({ description: 'Only admins can access instructor applications', })
    async findAll(@Query() query: InstructorApplicationQueryDto,): Promise<PaginatedInstructorApplicationsResponseDto> {
        const result = await this._adminInstructorService.getApplicationsForAdmin(query);

        return PaginatedInstructorApplicationsResponseDto.fromResult('Instructor applications fetched successfully', result,);
    }

    @Get(':applicationId/offerings/:offeringId/media/:mediaId/view-url')
    @ApiOperation({ summary: 'Get a signed offering-media URL for admin review', })
    @ApiOkResponse({ type: PresignedDownloadResponseDto })
    async getOfferingMediaViewUrl(@Param('applicationId') applicationId: string, @Param('offeringId') offeringId: string, @Param('mediaId') mediaId: string,
    ): Promise<PresignedDownloadResponseDto> {
        const view = await this._adminInstructorService.getOfferingMediaViewUrl(applicationId, offeringId, mediaId,);

        return PresignedDownloadResponseDto.create(view);
    }

    @Get(':applicationId')
    @ApiOperation({ summary: 'Get an instructor application for review', })
    @ApiOkResponse({ type: InstructorApplicationResponseDto, })
    @ApiNotFoundResponse({ description: 'Instructor application not found', })
    async findOne(@Param('applicationId') applicationId: string,): Promise<InstructorApplicationResponseDto> {
        const application = await this._adminInstructorService.getApplicationForAdmin(applicationId);

        return InstructorApplicationResponseDto.fromEntity('Instructor application fetched successfully', application,);
    }

    @Patch(':applicationId/offerings/:offeringId/review')
    @ApiOperation({ summary: 'Approve, reject, or request changes for an offering', })
    @ApiOkResponse({ type: InstructorApplicationResponseDto, })
    @ApiNotFoundResponse({ description: 'Application or offering not found', })
    async reviewOffering(@Param('applicationId') applicationId: string, @Param('offeringId') offeringId: string, @UserId()
    adminUserId: string, @Body() dto: ReviewOfferingDto,): Promise<InstructorApplicationResponseDto> {
        const application = await this._adminInstructorService.reviewOffering(
            applicationId,
            offeringId,
            adminUserId,
            dto.decision,
            dto.reviewNote,
        );

        return InstructorApplicationResponseDto.fromEntity('Offering review saved successfully', application,);
    }
}