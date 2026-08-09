import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CategoryEntity } from "../../entities/category.entity";
import { SubcategoryEntity } from "../../entities/subcategory.entity";

export class SubcategoryDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    categoryId!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    slug!: string;

    @ApiPropertyOptional({ nullable: true })
    description?: string | null;

    @ApiPropertyOptional({ nullable: true })
    imageUrl?: string | null;

    @ApiProperty()
    isActive!: boolean;

    @ApiProperty()
    sortOrder!: number;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;

    static fromEntity(entity: SubcategoryEntity): SubcategoryDto {
        return {
            id: entity.id,
            categoryId: entity.categoryId,
            name: entity.name,
            slug: entity.slug,
            description: entity.description,
            imageUrl: entity.imageUrl,
            isActive: entity.isActive,
            sortOrder: entity.sortOrder,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        };
    }
}

export class CategoryDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    slug!: string;

    @ApiPropertyOptional({ nullable: true })
    description?: string | null;

    @ApiPropertyOptional({ nullable: true })
    imageUrl?: string | null;

    @ApiProperty()
    isActive!: boolean;

    @ApiProperty()
    sortOrder!: number;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;

    @ApiProperty({ type: [SubcategoryDto] })
    subcategories!: SubcategoryDto[];

    static fromEntity(entity: CategoryEntity): CategoryDto {
        return {
            id: entity.id,
            name: entity.name,
            slug: entity.slug,
            description: entity.description,
            imageUrl: entity.imageUrl,
            isActive: entity.isActive,
            sortOrder: entity.sortOrder,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            subcategories: entity.subcategories.map(SubcategoryDto.fromEntity,),
        };
    }
}

export class CategoryResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: CategoryDto })
    data!: CategoryDto;

    static fromEntity(message: string, entity: CategoryEntity,): CategoryResponseDto {
        return {
            success: true,
            message,
            data: CategoryDto.fromEntity(entity),
        };
    }
}

export class CategoryListResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: [CategoryDto] })
    data!: CategoryDto[];

    static fromEntities(message: string, entities: CategoryEntity[],): CategoryListResponseDto {
        return {
            success: true,
            message,
            data: entities.map(CategoryDto.fromEntity),
        };
    }
}