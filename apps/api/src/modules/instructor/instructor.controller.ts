import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserId } from '@/shared/decorators/user-id.decorator';
import { MessageResponseDto } from '@/shared/dto/response/message-response.dto';
import { UpdateInstructorProfileDto } from './dto/request/update-instructor-profile.dto';
import { CreateOfferingDto } from './dto/request/create-offering.dto';
import { UpdateOfferingDto } from './dto/request/update-offering.dto';
import { RequestOfferingMediaUploadDto } from './dto/request/request-offering-media-upload.dto';
import { ConfirmOfferingMediaUploadDto } from './dto/request/confirm-offering-media-upload.dto';
import { InstructorApplicationResponseDto, InstructorOfferingResponseDto, InstructorProfileResponseDto, OfferingMediaResponseDto, PresignedDownloadResponseDto, PresignedUploadResponseDto } from './dto/response/instructor-response.dto';
import { INSTRUCTOR_SERVICE, type IInstructorService } from './services/interfaces/instructor.service.interface';
import { PublicInstructorListResponseDto, PublicInstructorResponseDto } from './dto/response/public-catelog-response.dto';
import { PublicInstructorQueryDto } from './dto/request/public-instructor-query.dto';
import { Public } from '@/shared/decorators/public.decorator';

@ApiTags('Instructor')
@Controller('instructors')
export class InstructorController {
    constructor(
        @Inject(INSTRUCTOR_SERVICE)
        private readonly _instructorService: IInstructorService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'List approved instructors and offerings' })
    @ApiOkResponse({ type: PublicInstructorListResponseDto })
    async getInstructors(@Query() query: PublicInstructorQueryDto): Promise<PublicInstructorListResponseDto> {
        return this._instructorService.getPublicInstructors(query);
    }

    @Get('onboarding')
    @ApiOperation({ summary: 'Get instructor onboarding workspace' })
    @ApiOkResponse({ type: InstructorProfileResponseDto })
    async getWorkspace(@UserId() userId: string): Promise<InstructorProfileResponseDto> {
        return this._instructorService.getWorkspace(userId);
    }

    @Public()
    @Get(':profileId')
    @ApiOperation({ summary: 'Get one approved instructor profile' })
    @ApiOkResponse({ type: PublicInstructorResponseDto })
    @ApiNotFoundResponse({ description: 'Instructor not found' })
    async getInstructor(@Param('profileId') profileId: string): Promise<PublicInstructorResponseDto> {
        return this._instructorService.getPublicInstructor(profileId);
    }

    @Patch('profile')
    @ApiOperation({ summary: 'Create or update instructor profile' })
    @ApiOkResponse({ type: InstructorProfileResponseDto })
    async saveProfile(@UserId() userId: string, @Body() dto: UpdateInstructorProfileDto): Promise<InstructorProfileResponseDto> {
        return this._instructorService.saveProfile(userId, dto);
    }

    @Post('offerings')
    @ApiOperation({ summary: 'Create an instructor offering' })
    @ApiOkResponse({ type: InstructorOfferingResponseDto })
    async addOffering(@UserId() userId: string, @Body() dto: CreateOfferingDto): Promise<InstructorOfferingResponseDto> {
        return this._instructorService.addOffering(userId, dto);
    }

    @Patch('offerings/:offeringId')
    @ApiOperation({ summary: 'Update an instructor offering' })
    @ApiOkResponse({ type: InstructorOfferingResponseDto })
    async updateOffering(
        @UserId() userId: string,
        @Param('offeringId') offeringId: string,
        @Body() dto: UpdateOfferingDto,
    ): Promise<InstructorOfferingResponseDto> {
        return this._instructorService.updateOffering(userId, offeringId, dto);
    }

    @Delete('offerings/:offeringId')
    @ApiOperation({ summary: 'Remove an instructor offering' })
    @ApiOkResponse({ type: MessageResponseDto })
    async removeOffering(@UserId() userId: string, @Param('offeringId') offeringId: string): Promise<MessageResponseDto> {
        return this._instructorService.removeOffering(userId, offeringId);
    }

    @Post('offerings/:offeringId/media/upload-url')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Create offering media upload URL' })
    @ApiOkResponse({ type: PresignedUploadResponseDto })
    async createMediaUploadUrl(
        @UserId() userId: string,
        @Param('offeringId') offeringId: string,
        @Body() dto: RequestOfferingMediaUploadDto,
    ): Promise<PresignedUploadResponseDto> {
        return this._instructorService.createMediaUploadUrl(userId, offeringId, dto);
    }

    @Post('offerings/:offeringId/media/confirm')
    @ApiOperation({ summary: 'Confirm offering media upload' })
    @ApiOkResponse({ type: OfferingMediaResponseDto })
    async confirmMediaUpload(
        @UserId() userId: string,
        @Param('offeringId') offeringId: string,
        @Body() dto: ConfirmOfferingMediaUploadDto,
    ): Promise<OfferingMediaResponseDto> {
        return this._instructorService.confirmMediaUpload(userId, offeringId, dto);
    }

    @Get('offerings/:offeringId/media/:mediaId/view-url')
    @ApiOperation({ summary: 'Get offering media view URL' })
    @ApiOkResponse({ type: PresignedDownloadResponseDto })
    async getMediaViewUrl(
        @UserId() userId: string,
        @Param('offeringId') offeringId: string,
        @Param('mediaId') mediaId: string,
    ): Promise<PresignedDownloadResponseDto> {
        return this._instructorService.getMediaViewUrl(userId, offeringId, mediaId);
    }

    @Delete('offerings/:offeringId/media/:mediaId')
    @ApiOperation({ summary: 'Remove offering media' })
    @ApiOkResponse({ type: MessageResponseDto })
    async removeMedia(
        @UserId() userId: string,
        @Param('offeringId') offeringId: string,
        @Param('mediaId') mediaId: string,
    ): Promise<MessageResponseDto> {
        return this._instructorService.removeMedia(userId, offeringId, mediaId);
    }

    @Post('applications/:applicationId/cancel')
    @ApiOperation({ summary: 'Cancel the current pending instructor application' })
    @ApiOkResponse({ type: MessageResponseDto })
    async cancelApplication(@UserId() userId: string, @Param('applicationId') applicationId: string): Promise<MessageResponseDto> {
        return this._instructorService.cancelApplication(userId, applicationId);
    }

    @Post('submit')
    @ApiOperation({ summary: 'Submit instructor application' })
    @ApiOkResponse({ type: InstructorApplicationResponseDto })
    async submitApplication(@UserId() userId: string): Promise<InstructorApplicationResponseDto> {
        return this._instructorService.submitApplication(userId);
    }
}