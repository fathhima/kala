import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationMetaDto } from '@/shared/dto/response/pagination-meta.dto'
import { IPaginatedResult } from '@/shared/types/paginated-result'
import { PublicInstructorResponse } from '../../types/public-instructor.type'

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

  static fromEntity(entity: PublicInstructorResponse): PublicInstructorDto {
    const dto = new PublicInstructorDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.imageUrl = entity.imageUrl;
    dto.bio = entity.bio;
    dto.location = entity.location;
    dto.portfolioUrl = entity.portfolioUrl;
    dto.offerings = entity.offerings.map(o => {
      const offering = new PublicOfferingDto();
      offering.id = o.id;
      offering.title = o.title;
      offering.description = o.description;
      offering.hourlyRate = o.hourlyRate;
      offering.currency = o.currency;
      offering.experienceYears = o.experienceYears;
      const subcat = new PublicOfferingSubcategoryDto();
      subcat.id = o.subcategory.id;
      subcat.name = o.subcategory.name;
      subcat.slug = o.subcategory.slug;
      const cat = new PublicOfferingCategoryDto();
      cat.id = o.subcategory.category.id;
      cat.name = o.subcategory.category.name;
      cat.slug = o.subcategory.category.slug;

      subcat.category = cat;
      offering.subcategory = subcat;
      offering.media = o.media.map(m => {
        const media = new PublicMediaDto();
        media.id = m.id;
        media.type = m.type;
        media.viewUrl = m.viewUrl;
        return media;
      });
      return offering;
    });
    return dto;
  }
}

export class PublicInstructorResponseDto {
  @ApiProperty()
  success!: boolean

  @ApiProperty()
  message!: string

  @ApiProperty({ type: PublicInstructorDto })
  data!: PublicInstructorDto

  static fromEntity(message: string,entity: PublicInstructorResponse,): PublicInstructorResponseDto {
    const dto = new PublicInstructorResponseDto();
    dto.success = true;
    dto.message = message;
    dto.data = PublicInstructorDto.fromEntity(entity);
    return dto;
  }
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