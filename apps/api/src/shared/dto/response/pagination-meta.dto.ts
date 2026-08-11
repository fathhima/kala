import { ApiProperty } from '@nestjs/swagger'

export class PaginationMetaDto {
    @ApiProperty({ example: 1 })
    page!: number

    @ApiProperty({ example: 10 })
    limit!: number

    @ApiProperty({ example: 124 })
    total!: number

    @ApiProperty({ example: true })
    hasNextPage!: boolean

    @ApiProperty({ example: false })
    hasPrevPage!: boolean

    static create(page: number, limit: number, total: number): PaginationMetaDto {
        const dto = new PaginationMetaDto()
        const totalPages = Math.ceil(total / limit)

        dto.page = page
        dto.limit = limit
        dto.total = total
        dto.hasNextPage = totalPages > 0 ? page < totalPages : false
        dto.hasPrevPage = page > 1

        return dto
    }
}