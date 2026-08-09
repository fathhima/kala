import { Category, Subcategory } from '@prisma/client';
import { CategoryEntity } from '../entities/category.entity';
import { SubcategoryEntity } from '../entities/subcategory.entity';

type CategoryWithSubcategories = Category & {
    subcategories?: Subcategory[];
};

export class CategoryMapper {
    static toSubcategoryEntity(subcategory: Subcategory,): SubcategoryEntity {
        return {
            id: subcategory.id,
            categoryId: subcategory.categoryId,
            name: subcategory.name,
            slug: subcategory.slug,
            description: subcategory.description,
            imageUrl: subcategory.imageUrl,
            isActive: subcategory.isActive,
            sortOrder: subcategory.sortOrder,
            createdAt: subcategory.createdAt,
            updatedAt: subcategory.updatedAt,
        };
    }

    static toCategoryEntity(category: CategoryWithSubcategories,): CategoryEntity {
        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            imageUrl: category.imageUrl,
            isActive: category.isActive,
            sortOrder: category.sortOrder,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
            subcategories: (category.subcategories ?? []).map(CategoryMapper.toSubcategoryEntity,),
        };
    }
}