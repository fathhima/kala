import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUrl, MaxLength, Min, } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({
        example: 'Art & Craft',
        description: 'Name of the category.',
    })
    @IsString()
    @Transform(({ value }) => value?.trim())
    @MaxLength(100)
    name!: string;

    @ApiPropertyOptional({
        example: 'art-and-craft',
        description: 'Optional URL-safe identifier for the category. Generated from the name when omitted.',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @MaxLength(120)
    slug?: string;

    @ApiPropertyOptional({
        example: 'Learn creative skills such as painting, drawing, and handmade crafts.',
        description: 'Optional description of the category.',
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({
        example: 'https://cdn.example.com/category.jpg',
        description: 'Optional URL of the image representing the category.',
    })
    @IsOptional()
    @IsUrl()
    @MaxLength(2_000)
    imageUrl?: string;

    @ApiPropertyOptional({
        example: 1,
        description: 'Optional display order of the category. Lower values appear before higher values.',
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    sortOrder?: number;
}