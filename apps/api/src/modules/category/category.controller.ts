import { Body, Controller, Get, Param, Patch, Post, } from '@nestjs/common';
import { ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse, } from '@nestjs/swagger';
import { Roles } from '@/shared/decorators/roles.decorator';
import { UserRole } from '@/shared/enums/role.enum';
import { CategoryService } from './category.service';
import { CategoryListResponseDto, CategoryResponseDto } from './dto/response/category-response.dto';
import { CreateCategoryDto } from './dto/request/create-category.dto';
import { UpdateCategoryDto } from './dto/request/update-category.dto';
import { SubcategoryListResponseDto, SubcategoryResponseDto } from './dto/response/subcategory-response.dto';
import { CreateSubcategoryDto } from './dto/request/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/request/update-subcategory.dto';

@ApiTags('Admin Categories')
@Controller('admin/categories')
@Roles(UserRole.ADMIN)
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Get all categories and subcategories for admin management', })
    @ApiOkResponse({ type: CategoryListResponseDto })
    @ApiUnauthorizedResponse({ description: 'Access token is missing or invalid', })
    @ApiForbiddenResponse({ description: 'Only admins can access this resource', })
    async findAll(): Promise<CategoryListResponseDto> {
        const categories = await this.categoryService.findAll();

        return CategoryListResponseDto.fromEntities(
            'Categories fetched successfully',
            categories,
        );
    }

    @Post()
    @ApiOperation({ summary: 'Create a category' })
    @ApiCreatedResponse({ type: CategoryResponseDto })
    @ApiConflictResponse({ description: 'A category with this slug already exists', })
    async createCategory(@Body() dto: CreateCategoryDto,): Promise<CategoryResponseDto> {
        const category = await this.categoryService.createCategory(dto);

        return CategoryResponseDto.fromEntity(
            'Category created successfully',
            category,
        );
    }

    @Patch(':categoryId')
    @ApiOperation({ summary: 'Update or archive a category', })
    @ApiOkResponse({ type: CategoryResponseDto })
    @ApiNotFoundResponse({ description: 'Category not found' })
    @ApiConflictResponse({
        description: 'A category with this slug already exists',
    })
    async updateCategory(@Param('categoryId') categoryId: string, @Body() dto: UpdateCategoryDto,): Promise<CategoryResponseDto> {
        const category = await this.categoryService.updateCategory(
            categoryId,
            dto,
        );

        return CategoryResponseDto.fromEntity(
            'Category updated successfully',
            category,
        );
    }

    @Get(':categoryId/subcategories')
    @ApiOperation({ summary: 'Get subcategories in a category', })
    @ApiOkResponse({ type: SubcategoryListResponseDto })
    @ApiNotFoundResponse({ description: 'Category not found' })
    async findSubcategories(@Param('categoryId') categoryId: string,): Promise<SubcategoryListResponseDto> {
        const subcategories = await this.categoryService.findSubcategories(categoryId);

        return SubcategoryListResponseDto.fromEntities(
            'Subcategories fetched successfully',
            subcategories,
        );
    }

    @Post(':categoryId/subcategories')
    @ApiOperation({ summary: 'Create a subcategory within a category', })
    @ApiCreatedResponse({ type: SubcategoryResponseDto })
    @ApiNotFoundResponse({ description: 'Category not found' })
    @ApiConflictResponse({ description: 'A subcategory with this slug already exists in this category', })
    async createSubcategory(@Param('categoryId') categoryId: string, @Body() dto: CreateSubcategoryDto,): Promise<SubcategoryResponseDto> {
        const subcategory = await this.categoryService.createSubcategory(categoryId, dto);

        return SubcategoryResponseDto.fromEntity(
            'Subcategory created successfully',
            subcategory,
        );
    }

    @Patch(':categoryId/subcategories/:subcategoryId')
    @ApiOperation({ summary: 'Update or archive a subcategory', })
    @ApiOkResponse({ type: SubcategoryResponseDto })
    @ApiNotFoundResponse({ description: 'Category or subcategory not found', })
    @ApiConflictResponse({ description: 'A subcategory with this slug already exists in this category', })
    async updateSubcategory(@Param('categoryId') categoryId: string, @Param('subcategoryId') subcategoryId: string, @Body() dto: UpdateSubcategoryDto,): Promise<SubcategoryResponseDto> {
        const subcategory = await this.categoryService.updateSubcategory(
            categoryId,
            subcategoryId,
            dto,
        );

        return SubcategoryResponseDto.fromEntity(
            'Subcategory updated successfully',
            subcategory,
        );
    }
}