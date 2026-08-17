import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateInstructorProfileDto {
    @ApiPropertyOptional({ maxLength: 2_000 })
    @IsOptional()
    @IsString()
    @MaxLength(2_000)
    bio?: string;

    @ApiPropertyOptional({ maxLength: 120 })
    @IsOptional()
    @IsString()
    @MaxLength(120)
    location?: string;
}