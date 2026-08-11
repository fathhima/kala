import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBooleanString, IsOptional, IsString } from 'class-validator'
import { PaginationQueryDto } from '@/shared/dto/request/pagination-query.dto'

export class CategoryQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({ example: 'painting' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => {
        if (typeof value !== 'string') return undefined
        const trimmed = value.trim()
        return trimmed.length > 0 ? trimmed : undefined
    })
    search?: string

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBooleanString()
    isActive?: string
}