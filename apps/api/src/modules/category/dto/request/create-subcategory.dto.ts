import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUrl, MaxLength, Min, } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, } from '@nestjs/swagger';

export class CreateSubcategoryDto {
    @ApiProperty({
        example: 'Watercolor Painting',
        description: 'Name of the subcategory.',
    })
    @IsString()
    @Transform(({ value }) => value?.trim())
    @MaxLength(100)
    name!: string;

    @ApiPropertyOptional({
        example: 'watercolor-painting',
        description: 'Optional URL-safe identifier for the subcategory. Generated from the name when omitted.',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @MaxLength(120)
    slug?: string;

    @ApiPropertyOptional({
        example: 'Learn watercolor painting techniques from beginner to advanced level.',
        description: 'Optional description of the subcategory.',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({
        example: 1,
        description: 'Optional display order of the subcategory. Lower values appear before higher values.',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    sortOrder?: number;
}