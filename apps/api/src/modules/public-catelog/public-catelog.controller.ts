import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Public } from '@/shared/decorators/public.decorator'
import { PublicInstructorQueryDto } from './dto/request/public-instructor-query.dto'
import { PublicCatalogService } from './public-catelog.service'
import { PublicCategoryListResponseDto, PublicInstructorListResponseDto, PublicInstructorResponseDto } from './dto/response/public-catelog-response.dto'

@ApiTags('Public catalog')
@Public()
@Controller('public/catalog')
export class PublicCatalogController {
    constructor(
        private readonly publicCatalogService: PublicCatalogService,
    ) { }

    @Get('categories')
    @ApiOperation({ summary: 'List active categories and subcategories' })
    @ApiOkResponse({ type: PublicCategoryListResponseDto })
    async getCategories(): Promise<PublicCategoryListResponseDto> {
        const categories = await this.publicCatalogService.getCategories()

        return {
            success: true,
            message: 'Categories fetched successfully',
            data: categories,
        }
    }

    @Get('instructors')
    @ApiOperation({ summary: 'List approved instructors and offerings' })
    @ApiOkResponse({ type: PublicInstructorListResponseDto })
    async getInstructors(@Query() query: PublicInstructorQueryDto,): Promise<PublicInstructorListResponseDto> {
        const result = await this.publicCatalogService.getInstructors(query)

        return {
            success: true,
            message: 'Instructors fetched successfully',
            data: result,
        }
    }

    @Get('instructors/:profileId')
    @ApiOperation({ summary: 'Get one approved instructor profile' })
    @ApiOkResponse({ type: PublicInstructorResponseDto })
    @ApiNotFoundResponse({ description: 'Instructor not found' })
    async getInstructor(@Param('profileId') profileId: string,): Promise<PublicInstructorResponseDto> {
        const instructor = await this.publicCatalogService.getInstructor(profileId)

        return {
            success: true,
            message: 'Instructor fetched successfully',
            data: instructor,
        }
    }
}