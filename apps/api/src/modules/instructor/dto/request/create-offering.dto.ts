import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, } from 'class-validator';

export class CreateOfferingDto {
    @ApiProperty()
    @IsString()
    @MaxLength(100)
    subcategoryId!: string;

    @ApiPropertyOptional({ maxLength: 160 })
    @IsOptional()
    @IsString()
    @MaxLength(160)
    title?: string;

    @ApiPropertyOptional({ maxLength: 4_000 })
    @IsOptional()
    @IsString()
    @MaxLength(4_000)
    description?: string;

    @ApiProperty({ example: 1200 })
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(1)
    @Max(1_000_000)
    hourlyRate!: number;

    @ApiPropertyOptional({ default: 'INR', maxLength: 3 })
    @IsOptional()
    @IsString()
    @MaxLength(3)
    currency?: string;

    @ApiPropertyOptional({ example: 4 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(80)
    experienceYears?: number;
}