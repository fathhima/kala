import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, MaxLength, Min, } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubcategoryDto {
    @ApiPropertyOptional({
        example: 'Watercolor Painting',
        description: 'Updated name of the subcategory.',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({
        example: 'watercolor-painting',
        description: 'Updated URL-safe identifier for the subcategory.',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @MaxLength(120)
    slug?: string;

    @ApiPropertyOptional({
        example: 'Learn watercolor painting techniques from beginner to advanced level.',
        description: 'Updated description of the subcategory. Can be set to null to remove the description.',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @MaxLength(500)
    description?: string | null;

    @ApiPropertyOptional({
        example: 'https://cdn.example.com/subcategory-updated.jpg',
        description: 'Updated image URL for the subcategory. Can be set to null to remove the image.',
        nullable: true,
    })
    @IsOptional()
    @IsUrl()
    @MaxLength(2_000)
    imageUrl?: string | null;

    @ApiPropertyOptional({
        example: true,
        description: 'Whether the subcategory is active and available for use.',
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        example: 2,
        description: 'Updated display order of the subcategory. Lower values appear before higher values.',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    sortOrder?: number;
}