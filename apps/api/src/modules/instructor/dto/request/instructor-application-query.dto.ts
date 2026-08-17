import { InstructorApplicationStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '@/shared/dto/request/pagination-query.dto';

export class InstructorApplicationQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({ enum: InstructorApplicationStatus })
    @IsOptional()
    @IsEnum(InstructorApplicationStatus)
    status?: InstructorApplicationStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string;
}