import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min, } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
    @ApiPropertyOptional({
        example: 'Art & Craft',
        description: 'Updated name of the category.',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({
        example: 'art-and-craft',
        description: 'Updated URL-safe identifier for the category.',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @MaxLength(120)
    slug?: string;

    @ApiPropertyOptional({
        example: 'Learn creative skills such as painting, drawing, and handmade crafts.',
        description: 'Updated description of the category. Can be set to null to remove the description.',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @MaxLength(500)
    description?: string | null;

    @ApiPropertyOptional({
        example: 'https://cdn.example.com/category-updated.jpg',
        description: 'Updated image URL for the category. Can be set to null to remove the image.',
        nullable: true,
    })
    @IsOptional()
    @IsUrl()
    @MaxLength(2_000)
    imageUrl?: string | null;

    @ApiPropertyOptional({
        example: true,
        description: 'Whether the category is active and available for use.',
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        example: 2,
        description: 'Updated display order of the category. Lower values appear before higher values.',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    sortOrder?: number;
}