import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationMetaDto } from '@/shared/dto/response/pagination-meta.dto'
import { IPaginatedResult } from '@/shared/types/paginated-result'

export class PublicSubcategoryDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  slug!: string

  @ApiPropertyOptional({ type: String, nullable: true })
  description?: string | null
}

export class PublicCategoryDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  slug!: string

  @ApiPropertyOptional({ type: String, nullable: true })
  description?: string | null

  @ApiProperty({ type: [PublicSubcategoryDto] })
  subcategories!: PublicSubcategoryDto[]
}

export class PublicCategoryListResponseDto {
  @ApiProperty()
  success!: boolean

  @ApiProperty()
  message!: string

  @ApiProperty({ type: [PublicCategoryDto] })
  data!: PublicCategoryDto[]
}

export class PublicMediaDto {
  @ApiProperty()
  id!: string

  @ApiProperty({ enum: ['IMAGE', 'VIDEO'] })
  type!: 'IMAGE' | 'VIDEO'

  @ApiProperty()
  viewUrl!: string
}

export class PublicOfferingCategoryDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  slug!: string
}

export class PublicOfferingSubcategoryDto {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  slug!: string

  @ApiProperty({ type: PublicOfferingCategoryDto })
  category!: PublicOfferingCategoryDto
}

export class PublicOfferingDto {
  @ApiProperty()
  id!: string

  @ApiPropertyOptional({ type: String, nullable: true })
  title?: string | null

  @ApiPropertyOptional({ type: String, nullable: true })
  description?: string | null

  @ApiProperty()
  hourlyRate!: string

  @ApiProperty()
  currency!: string

  @ApiPropertyOptional({ type: Number, nullable: true })
  experienceYears?: number | null

  @ApiProperty({ type: PublicOfferingSubcategoryDto })
  subcategory!: PublicOfferingSubcategoryDto

  @ApiProperty({ type: [PublicMediaDto] })
  media!: PublicMediaDto[]
}

export class PublicInstructorDto {
  @ApiProperty({ description: 'Instructor profile ID' })
  id!: string

  @ApiProperty()
  name!: string

  @ApiPropertyOptional({ type: String, nullable: true })
  imageUrl?: string | null

  @ApiPropertyOptional({ type: String, nullable: true })
  bio?: string | null

  @ApiPropertyOptional({ type: String, nullable: true })
  location?: string | null

  @ApiPropertyOptional({ type: String, nullable: true })
  portfolioUrl?: string | null

  @ApiProperty({ type: [PublicOfferingDto] })
  offerings!: PublicOfferingDto[]
}

export class PublicInstructorResponseDto {
  @ApiProperty()
  success!: boolean

  @ApiProperty()
  message!: string

  @ApiProperty({ type: PublicInstructorDto })
  data!: PublicInstructorDto
}

export class PublicInstructorListDataDto {
  @ApiProperty({ type: [PublicInstructorDto] })
  items!: PublicInstructorDto[]

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto
}

export class PublicInstructorListResponseDto {
  @ApiProperty()
  success!: boolean

  @ApiProperty()
  message!: string

  @ApiProperty({ type: PublicInstructorListDataDto })
  data!: PublicInstructorListDataDto

  static fromResult(message: string, result: IPaginatedResult<any>): PublicInstructorListResponseDto {
    const dto = new PublicInstructorListResponseDto();
    dto.success = true;
    dto.message = message;
    dto.data = {
      items: result.items,
      meta: PaginationMetaDto.create(result.page, result.limit, result.total),
    };
    return dto;
  }
}