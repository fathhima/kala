import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, } from '@nestjs/common';
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

@ApiTags('Instructor')
@Controller('instructors')
export class InstructorController {
    constructor(
        @Inject(INSTRUCTOR_SERVICE)
        private readonly _instructorService: IInstructorService) { }

    @Get()
    @ApiOperation({ summary: 'List approved instructors and offerings' })
    @ApiOkResponse({ type: PublicInstructorListResponseDto })
    async getInstructors(@Query() query: PublicInstructorQueryDto,): Promise<PublicInstructorListResponseDto> {
        const data = await this._instructorService.getPublicInstructors(query);

        return {
            success: true,
            message: 'Instructors fetched successfully',
            data,
        };
    }

    @Get('onboarding')
    @ApiOperation({ summary: 'Get instructor onboarding workspace', })
    @ApiOkResponse({ type: InstructorProfileResponseDto, })
    async getWorkspace(@UserId() userId: string,): Promise<InstructorProfileResponseDto> {
        const profile = await this._instructorService.getWorkspace(userId);

        return InstructorProfileResponseDto.fromEntity('Instructor onboarding fetched successfully', profile,);
    }

    @Get(':profileId')
    @ApiOperation({ summary: 'Get one approved instructor profile' })
    @ApiOkResponse({ type: PublicInstructorResponseDto })
    @ApiNotFoundResponse({ description: 'Instructor not found' })
    async getInstructor(@Param('profileId') profileId: string,): Promise<PublicInstructorResponseDto> {
        const instructor = await this._instructorService.getPublicInstructor(profileId);

        return {
            success: true,
            message: 'Instructor fetched successfully',
            data: instructor,
        };
    }

    @Patch('profile')
    @ApiOperation({ summary: 'Create or update instructor profile', })
    @ApiOkResponse({ type: InstructorProfileResponseDto, })
    async saveProfile(@UserId() userId: string, @Body() dto: UpdateInstructorProfileDto,): Promise<InstructorProfileResponseDto> {
        const profile = await this._instructorService.saveProfile(userId, dto);

        return InstructorProfileResponseDto.fromEntity('Instructor profile saved successfully', profile,);
    }

    @Post('offerings')
    @ApiOperation({ summary: 'Create an instructor offering', })
    @ApiOkResponse({ type: InstructorOfferingResponseDto, })
    async addOffering(@UserId() userId: string, @Body() dto: CreateOfferingDto,): Promise<InstructorOfferingResponseDto> {
        const offering = await this._instructorService.addOffering(userId, dto,);

        return InstructorOfferingResponseDto.fromEntity('Offering created successfully', offering,);
    }

    @Patch('offerings/:offeringId')
    @ApiOperation({ summary: 'Update an instructor offering', })
    @ApiOkResponse({ type: InstructorOfferingResponseDto, })
    async updateOffering(@UserId() userId: string, @Param('offeringId') offeringId: string, @Body() dto: UpdateOfferingDto,
    ): Promise<InstructorOfferingResponseDto> {
        const offering = await this._instructorService.updateOffering(userId, offeringId, dto,);

        return InstructorOfferingResponseDto.fromEntity('Offering updated successfully', offering,);
    }

    @Delete('offerings/:offeringId')
    @ApiOperation({ summary: 'Remove an instructor offering', })
    @ApiOkResponse({ type: MessageResponseDto, })
    async removeOffering(@UserId() userId: string, @Param('offeringId') offeringId: string,): Promise<MessageResponseDto> {
        await this._instructorService.removeOffering(userId, offeringId);

        return MessageResponseDto.success('Offering removed successfully',);
    }

    @Post('offerings/:offeringId/media/upload-url')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Create offering media upload URL', })
    @ApiOkResponse({ type: PresignedUploadResponseDto, })
    async createMediaUploadUrl(@UserId() userId: string, @Param('offeringId') offeringId: string,
        @Body() dto: RequestOfferingMediaUploadDto,): Promise<PresignedUploadResponseDto> {
        const upload = await this._instructorService.createMediaUploadUrl(userId, offeringId, dto,);

        return PresignedUploadResponseDto.create(upload);
    }

    @Post('offerings/:offeringId/media/confirm')
    @ApiOperation({ summary: 'Confirm offering media upload', })
    @ApiOkResponse({ type: OfferingMediaResponseDto, })
    async confirmMediaUpload(@UserId() userId: string, @Param('offeringId') offeringId: string,
        @Body() dto: ConfirmOfferingMediaUploadDto,): Promise<OfferingMediaResponseDto> {
        const media = await this._instructorService.confirmMediaUpload(userId, offeringId, dto,);

        return OfferingMediaResponseDto.fromEntity('Offering media attached successfully', media,);
    }

    @Get('offerings/:offeringId/media/:mediaId/view-url')
    @ApiOperation({ summary: 'Get offering media view URL', })
    @ApiOkResponse({ type: PresignedDownloadResponseDto, })
    async getMediaViewUrl(@UserId() userId: string, @Param('offeringId') offeringId: string, @Param('mediaId') mediaId: string,
    ): Promise<PresignedDownloadResponseDto> {
        const view = await this._instructorService.getMediaViewUrl(userId, offeringId, mediaId,);

        return PresignedDownloadResponseDto.create(view);
    }

    @Delete('offerings/:offeringId/media/:mediaId')
    @ApiOperation({ summary: 'Remove offering media', })
    @ApiOkResponse({ type: MessageResponseDto, })
    async removeMedia(@UserId() userId: string, @Param('offeringId') offeringId: string, @Param('mediaId') mediaId: string,
    ): Promise<MessageResponseDto> {
        await this._instructorService.removeMedia(userId, offeringId, mediaId,);

        return MessageResponseDto.success('Offering media removed successfully',);
    }

    @Post('applications/:applicationId/cancel')
    @ApiOperation({ summary: 'Cancel the current pending instructor application' })
    @ApiOkResponse({ type: MessageResponseDto })
    async cancelApplication(@UserId() userId: string, @Param('applicationId') applicationId: string,): Promise<MessageResponseDto> {
        await this._instructorService.cancelApplication(userId, applicationId);

        return MessageResponseDto.success('Instructor application cancelled successfully',);
    }

    @Post('submit')
    @ApiOperation({ summary: 'Submit instructor application', })
    @ApiOkResponse({ type: InstructorApplicationResponseDto, })
    async submitApplication(@UserId() userId: string,): Promise<InstructorApplicationResponseDto> {
        const application = await this._instructorService.submitApplication(userId);

        return InstructorApplicationResponseDto.fromEntity('Instructor application submitted successfully', application,);
    }
}