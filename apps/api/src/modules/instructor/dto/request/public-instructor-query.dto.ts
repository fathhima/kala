import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'
import { PaginationQueryDto } from '@/shared/dto/request/pagination-query.dto'

export class PublicInstructorQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(100)
    search?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    subcategoryId?: string
}