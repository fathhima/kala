import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoryListResponseDto } from './dto/response/category-response.dto';
import { CATEGORY_SERVICE, type ICategoryService } from './services/interfaces/category.service.interface';
import { Public } from '@/shared/decorators/public.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
    constructor(
        @Inject(CATEGORY_SERVICE)
        private readonly _categoryService: ICategoryService,
    ) { }

    @Public()
    @Get('selectable')
    @ApiOperation({ summary: 'Get selectable categories and subcategories' })
    @ApiOkResponse({ type: CategoryListResponseDto })
    async findSelectable(): Promise<CategoryListResponseDto> {
        return this._categoryService.findSelectable();
    }
}