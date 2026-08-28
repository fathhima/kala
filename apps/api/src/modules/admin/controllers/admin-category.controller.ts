import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserRole } from '@/shared/enums/role.enum';
import { CategoryResponseDto, PaginatedCategoryResponseDto } from '@/modules/category/dto/response/category-response.dto';
import { CategoryQueryDto } from '@/modules/category/dto/request/category-query.dto';
import { CreateCategoryDto } from '@/modules/category/dto/request/create-category.dto';
import { UpdateCategoryDto } from '@/modules/category/dto/request/update-category.dto';
import { SubcategoryListResponseDto, SubcategoryResponseDto } from '@/modules/category/dto/response/subcategory-response.dto';
import { CreateSubcategoryDto } from '@/modules/category/dto/request/create-subcategory.dto';
import { UpdateSubcategoryDto } from '@/modules/category/dto/request/update-subcategory.dto';
import { CategoryImageUploadResponseDto } from '@/modules/category/dto/response/category-image-upload-response.dto';
import { RequestCategoryImageUploadDto } from '@/modules/category/dto/request/create-category-image-upload.dto';
import { ConfirmCategoryImageUploadDto } from '@/modules/category/dto/request/confirm-category-image-upload.dto';
import { CategoryImageViewResponseDto } from '@/modules/category/dto/response/category-image-view-response.dto';
import { SubcategoryImageUploadResponseDto } from '@/modules/category/dto/response/subcategory-image-upload-response.dto';
import { SubcategoryImageViewResponseDto } from '@/modules/category/dto/response/subcategory-image-view-response.dto';
import { ADMIN_CATEGORY_SERVICE, type IAdminCategoryService } from '../services/interfaces/admin-category.service.interface';

@ApiTags('Admin Categories')
@Controller('admin/categories')
@Roles(UserRole.ADMIN)
export class AdminCategoryController {
    constructor(
        @Inject(ADMIN_CATEGORY_SERVICE)
        private readonly _categoryService: IAdminCategoryService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get paginated categories and subcategories for admin management' })
    @ApiOkResponse({ type: PaginatedCategoryResponseDto })
    async findAll(@Query() query: CategoryQueryDto): Promise<PaginatedCategoryResponseDto> {
        const result = await this._categoryService.findManyForAdmin(query)

        return PaginatedCategoryResponseDto.fromResult('Categories fetched successfully', result,)
    }

    @Post()
    @ApiOperation({ summary: 'Create a category' })
    @ApiCreatedResponse({ type: CategoryResponseDto })
    @ApiConflictResponse({ description: 'A category with this slug already exists', })
    async createCategory(@Body() dto: CreateCategoryDto,): Promise<CategoryResponseDto> {
        const category = await this._categoryService.createCategory(dto);

        return CategoryResponseDto.fromEntity('Category created successfully', category,);
    }

    @Patch(':categoryId')
    @ApiOperation({ summary: 'Update or archive a category', })
    @ApiOkResponse({ type: CategoryResponseDto })
    @ApiNotFoundResponse({ description: 'Category not found' })
    @ApiConflictResponse({
        description: 'A category with this slug already exists',
    })
    async updateCategory(@Param('categoryId') categoryId: string, @Body() dto: UpdateCategoryDto,): Promise<CategoryResponseDto> {
        const category = await this._categoryService.updateCategory(categoryId, dto,);

        return CategoryResponseDto.fromEntity('Category updated successfully', category,);
    }

    @Get(':categoryId/subcategories')
    @ApiOperation({ summary: 'Get subcategories in a category', })
    @ApiOkResponse({ type: SubcategoryListResponseDto })
    @ApiNotFoundResponse({ description: 'Category not found' })
    async findSubcategories(@Param('categoryId') categoryId: string,): Promise<SubcategoryListResponseDto> {
        const subcategories = await this._categoryService.findSubcategories(categoryId);

        return SubcategoryListResponseDto.fromEntities('Subcategories fetched successfully', subcategories,);
    }

    @Post(':categoryId/subcategories')
    @ApiOperation({ summary: 'Create a subcategory within a category', })
    @ApiCreatedResponse({ type: SubcategoryResponseDto })
    @ApiNotFoundResponse({ description: 'Category not found' })
    @ApiConflictResponse({ description: 'A subcategory with this slug already exists in this category', })
    async createSubcategory(@Param('categoryId') categoryId: string, @Body() dto: CreateSubcategoryDto,): Promise<SubcategoryResponseDto> {
        const subcategory = await this._categoryService.createSubcategory(categoryId, dto);

        return SubcategoryResponseDto.fromEntity('Subcategory created successfully', subcategory,);
    }

    @Patch(':categoryId/subcategories/:subcategoryId')
    @ApiOperation({ summary: 'Update or archive a subcategory', })
    @ApiOkResponse({ type: SubcategoryResponseDto })
    @ApiNotFoundResponse({ description: 'Category or subcategory not found', })
    @ApiConflictResponse({ description: 'A subcategory with this slug already exists in this category', })
    async updateSubcategory(@Param('categoryId') categoryId: string, @Param('subcategoryId') subcategoryId: string, @Body() dto: UpdateSubcategoryDto,): Promise<SubcategoryResponseDto> {
        const subcategory = await this._categoryService.updateSubcategory(categoryId, subcategoryId, dto,);

        return SubcategoryResponseDto.fromEntity('Subcategory updated successfully', subcategory,);
    }

    @Post(':categoryId/image/upload-url')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Create a temporary S3 upload URL for a category image', })
    @ApiOkResponse({ type: CategoryImageUploadResponseDto })
    async createCategoryImageUploadUrl(@Param('categoryId') categoryId: string, @Body() dto: RequestCategoryImageUploadDto,): Promise<CategoryImageUploadResponseDto> {
        const upload = await this._categoryService.createCategoryImageUploadUrl(categoryId, dto,);

        return CategoryImageUploadResponseDto.create({
            storageKey: upload.key,
            uploadUrl: upload.uploadUrl,
            expiresInSeconds: upload.expiresInSeconds,
        });
    }

    @Post(':categoryId/image/confirm')
    @ApiOperation({ summary: 'Confirm and attach an uploaded category image', })
    @ApiOkResponse({ type: CategoryResponseDto })
    async confirmCategoryImageUpload(@Param('categoryId') categoryId: string, @Body() dto: ConfirmCategoryImageUploadDto,): Promise<CategoryResponseDto> {
        const category = await this._categoryService.confirmCategoryImageUpload(categoryId, dto,);

        return CategoryResponseDto.fromEntity('Category image updated successfully', category,);
    }

    @Get(':categoryId/image/view-url')
    @ApiOperation({ summary: 'Create a temporary private S3 view URL for a category image', })
    @ApiOkResponse({ type: CategoryImageViewResponseDto })
    async getCategoryImageViewUrl(@Param('categoryId') categoryId: string,): Promise<CategoryImageViewResponseDto> {
        const viewUrl = await this._categoryService.getCategoryImageViewUrl(categoryId);

        return CategoryImageViewResponseDto.create({
            storageKey: viewUrl.key,
            viewUrl: viewUrl.viewUrl,
            expiresInSeconds: viewUrl.expiresInSeconds,
        });
    }

    @Delete(':categoryId/image')
    @ApiOperation({ summary: 'Remove the image from a category and S3', })
    @ApiOkResponse({ type: CategoryResponseDto })
    async removeCategoryImage(@Param('categoryId') categoryId: string,): Promise<CategoryResponseDto> {
        const category = await this._categoryService.removeCategoryImage(categoryId);

        return CategoryResponseDto.fromEntity('Category image removed successfully', category,);
    }

    @Post(':categoryId/subcategories/:subcategoryId/image/upload-url')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Create a temporary S3 upload URL for a subcategory image', })
    @ApiOkResponse({ type: SubcategoryImageUploadResponseDto })
    async createSubcategoryImageUploadUrl(@Param('categoryId') categoryId: string, @Param('subcategoryId') subcategoryId: string, @Body() dto: RequestCategoryImageUploadDto,)
        : Promise<SubcategoryImageUploadResponseDto> {
        const upload = await this._categoryService.createSubcategoryImageUploadUrl(categoryId, subcategoryId, dto,);

        return SubcategoryImageUploadResponseDto.create({
            storageKey: upload.key,
            uploadUrl: upload.uploadUrl,
            expiresInSeconds: upload.expiresInSeconds,
        });
    }

    @Post(':categoryId/subcategories/:subcategoryId/image/confirm')
    @ApiOperation({ summary: 'Confirm and attach an uploaded subcategory image', })
    @ApiOkResponse({ type: SubcategoryResponseDto })
    async confirmSubcategoryImageUpload(@Param('categoryId') categoryId: string, @Param('subcategoryId') subcategoryId: string, @Body() dto: ConfirmCategoryImageUploadDto,): Promise<SubcategoryResponseDto> {
        const subcategory = await this._categoryService.confirmSubcategoryImageUpload(categoryId, subcategoryId, dto,);

        return SubcategoryResponseDto.fromEntity('Subcategory image updated successfully', subcategory,);
    }

    @Get(':categoryId/subcategories/:subcategoryId/image/view-url')
    @ApiOperation({ summary: 'Create a temporary private S3 view URL for a subcategory image', })
    @ApiOkResponse({ type: SubcategoryImageViewResponseDto })
    async getSubcategoryImageViewUrl(@Param('categoryId') categoryId: string, @Param('subcategoryId') subcategoryId: string,): Promise<SubcategoryImageViewResponseDto> {
        const view = await this._categoryService.getSubcategoryImageViewUrl(categoryId, subcategoryId,);

        return SubcategoryImageViewResponseDto.create({
            storageKey: view.key,
            viewUrl: view.viewUrl,
            expiresInSeconds: view.expiresInSeconds,
        });
    }

    @Delete(':categoryId/subcategories/:subcategoryId/image')
    @ApiOperation({ summary: 'Remove a subcategory image from the record and S3', })
    @ApiOkResponse({ type: SubcategoryResponseDto })
    async removeSubcategoryImage(@Param('categoryId') categoryId: string, @Param('subcategoryId') subcategoryId: string,): Promise<SubcategoryResponseDto> {
        const subcategory = await this._categoryService.removeSubcategoryImage(categoryId, subcategoryId,);

        return SubcategoryResponseDto.fromEntity('Subcategory image removed successfully', subcategory,);
    }
}