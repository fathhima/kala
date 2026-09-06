import { ApiProperty, ApiPropertyOptional, } from '@nestjs/swagger';
import { InstructorApplicationEntity, InstructorOfferingEntity, InstructorProfileEntity, OfferingMediaEntity, } from '../../entities/instructor-profile.entity';
import { PaginationMetaDto } from '@/shared/dto/response/pagination-meta.dto';
import { IPaginatedResult } from '@/shared/types';

const MEDIA_TYPES = ['IMAGE', 'VIDEO'] as const;
const OFFERING_STATUSES = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED', 'ARCHIVED',] as const;

export class OfferingMediaDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({ enum: MEDIA_TYPES })
    type!: (typeof MEDIA_TYPES)[number];

    @ApiProperty()
    storageKey!: string;

    @ApiProperty()
    mimeType!: string;

    @ApiProperty()
    sizeBytes!: number;

    @ApiProperty()
    sortOrder!: number;

    @ApiProperty({
        type: String,
        format: 'date-time',
    })
    createdAt!: Date;

    static fromEntity(entity: OfferingMediaEntity): OfferingMediaDto {
        return {
            id: entity.id,
            type: entity.type,
            storageKey: entity.storageKey,
            mimeType: entity.mimeType,
            sizeBytes: entity.sizeBytes,
            sortOrder: entity.sortOrder,
            createdAt: entity.createdAt,
        };
    }
}

export class InstructorOfferingCategoryDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    slug!: string;
}

export class InstructorOfferingSubcategoryDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    slug!: string;

    @ApiProperty({ type: InstructorOfferingCategoryDto, })
    category!: InstructorOfferingCategoryDto;
}

export class InstructorOfferingDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    profileId!: string;

    @ApiPropertyOptional({ type: String, nullable: true })
    applicationId?: string | null;

    @ApiProperty()
    subcategoryId!: string;

    @ApiPropertyOptional({ type: String, nullable: true })
    title?: string | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    description?: string | null;

    @ApiProperty()
    hourlyRate!: string;

    @ApiProperty()
    currency!: string;

    @ApiPropertyOptional({ type: Number, nullable: true })
    experienceYears?: number | null;

    @ApiProperty({ enum: OFFERING_STATUSES })
    status!: (typeof OFFERING_STATUSES)[number];

    @ApiPropertyOptional({ type: String, nullable: true })
    reviewNote?: string | null;

    @ApiPropertyOptional({
        type: String,
        format: 'date-time',
        nullable: true,
    })
    reviewedAt?: Date | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    reviewedBy?: string | null;

    @ApiProperty({
        type: String,
        format: 'date-time',
    })
    createdAt!: Date;

    @ApiProperty({
        type: String,
        format: 'date-time',
    })
    updatedAt!: Date;

    @ApiProperty({ type: InstructorOfferingSubcategoryDto, })
    subcategory!: InstructorOfferingSubcategoryDto;

    @ApiProperty({ type: [OfferingMediaDto], })
    media!: OfferingMediaDto[];

    static fromEntity(entity: InstructorOfferingEntity,): InstructorOfferingDto {
        return {
            id: entity.id,
            profileId: entity.profileId,
            applicationId: entity.applicationId,
            subcategoryId: entity.subcategoryId,
            title: entity.title,
            description: entity.description,
            hourlyRate: entity.hourlyRate,
            currency: entity.currency,
            experienceYears: entity.experienceYears,
            status: entity.status,
            reviewNote: entity.reviewNote,
            reviewedAt: entity.reviewedAt,
            reviewedBy: entity.reviewedBy,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            subcategory: {
                id: entity.subcategory.id,
                name: entity.subcategory.name,
                slug: entity.subcategory.slug,
                category: {
                    id: entity.subcategory.category.id,
                    name: entity.subcategory.category.name,
                    slug: entity.subcategory.category.slug,
                },
            },
            media: entity.media.map(OfferingMediaDto.fromEntity),
        };
    }
}

export class InstructorApplicantUserDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    email!: string;

    @ApiPropertyOptional({ type: String, nullable: true })
    imageUrl?: string | null;

    @ApiProperty({
        type: [String],
        example: ['STUDENT'],
    })
    roles!: string[];
}

export class InstructorApplicationProfileDto {
    @ApiProperty()
    id!: string;

    @ApiPropertyOptional({ type: String, nullable: true })
    bio?: string | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    location?: string | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    portfolioUrl?: string | null;

    @ApiProperty()
    status!: string;

    @ApiProperty({ type: InstructorApplicantUserDto, })
    user!: InstructorApplicantUserDto;

    static fromEntity(entity: NonNullable<InstructorApplicationEntity['profile']>,): InstructorApplicationProfileDto {
        return {
            id: entity.id,
            bio: entity.bio,
            location: entity.location,
            portfolioUrl: entity.portfolioUrl,
            status: entity.status,
            user: {
                id: entity.user.id,
                name: entity.user.name,
                email: entity.user.email,
                imageUrl: entity.user.imageUrl,
                roles: entity.user.roles,
            },
        };
    }
}

export class InstructorApplicationDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    profileId!: string;

    @ApiProperty()
    status!: string;

    @ApiProperty({
        type: String,
        format: 'date-time',
    })
    submittedAt!: Date;

    @ApiPropertyOptional({
        type: String,
        format: 'date-time',
        nullable: true,
    })
    reviewedAt?: Date | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    reviewedBy?: string | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    reviewNote?: string | null;

    @ApiProperty({
        type: String,
        format: 'date-time',
    })
    createdAt!: Date;

    @ApiProperty({
        type: String,
        format: 'date-time',
    })
    updatedAt!: Date;

    @ApiProperty({ type: [InstructorOfferingDto], })
    offerings!: InstructorOfferingDto[];

    @ApiPropertyOptional({
        type: InstructorApplicationProfileDto,
        nullable: true,
    })
    profile?: InstructorApplicationProfileDto;

    static fromEntity(entity: InstructorApplicationEntity,): InstructorApplicationDto {
        return {
            id: entity.id,
            profileId: entity.profileId,
            status: entity.status,
            submittedAt: entity.submittedAt,
            reviewedAt: entity.reviewedAt,
            reviewedBy: entity.reviewedBy,
            reviewNote: entity.reviewNote,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            offerings: entity.offerings.map(InstructorOfferingDto.fromEntity,),
            profile: entity.profile
                ? InstructorApplicationProfileDto.fromEntity(entity.profile)
                : undefined,
        };
    }
}

export class InstructorProfileDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    userId!: string;

    @ApiPropertyOptional({ type: String, nullable: true })
    bio?: string | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    location?: string | null;

    @ApiPropertyOptional({ type: String, nullable: true })
    portfolioUrl?: string | null;

    @ApiProperty()
    status!: string;

    @ApiProperty({
        type: String,
        format: 'date-time',
    })
    createdAt!: Date;

    @ApiProperty({
        type: String,
        format: 'date-time',
    })
    updatedAt!: Date;

    @ApiProperty({ type: [InstructorOfferingDto], })
    offerings!: InstructorOfferingDto[];

    @ApiPropertyOptional({
        type: InstructorApplicationDto,
        nullable: true,
    })
    latestApplication?: InstructorApplicationDto | null;

    static fromEntity(entity: InstructorProfileEntity,): InstructorProfileDto {
        return {
            id: entity.id,
            userId: entity.userId,
            bio: entity.bio,
            location: entity.location,
            portfolioUrl: entity.portfolioUrl,
            status: entity.status,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            offerings: entity.offerings.map(InstructorOfferingDto.fromEntity,),
            latestApplication: entity.latestApplication ? InstructorApplicationDto.fromEntity(entity.latestApplication,) : null,
        };
    }
}

export class InstructorProfileResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiPropertyOptional({
        type: InstructorProfileDto,
        nullable: true,
    })
    data!: InstructorProfileDto | null;

    static fromEntity(message: string, entity: InstructorProfileEntity | null,): InstructorProfileResponseDto {
        return {
            success: true,
            message,
            data: entity ? InstructorProfileDto.fromEntity(entity) : null,
        };
    }
}

export class InstructorOfferingResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: InstructorOfferingDto, })
    data!: InstructorOfferingDto;

    static fromEntity(message: string, entity: InstructorOfferingEntity,): InstructorOfferingResponseDto {
        return {
            success: true,
            message,
            data: InstructorOfferingDto.fromEntity(entity),
        };
    }
}

export class OfferingMediaResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: OfferingMediaDto, })
    data!: OfferingMediaDto;

    static fromEntity(message: string, entity: OfferingMediaEntity,): OfferingMediaResponseDto {
        return {
            success: true,
            message,
            data: OfferingMediaDto.fromEntity(entity),
        };
    }
}

export class InstructorApplicationResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: InstructorApplicationDto, })
    data!: InstructorApplicationDto;

    static fromEntity(message: string, entity: InstructorApplicationEntity,): InstructorApplicationResponseDto {
        return {
            success: true,
            message,
            data: InstructorApplicationDto.fromEntity(entity),
        };
    }
}

export class PaginatedInstructorApplicationsDataDto {
    @ApiProperty({ type: [InstructorApplicationDto], })
    items!: InstructorApplicationDto[];

    @ApiProperty({ type: PaginationMetaDto, })
    meta!: PaginationMetaDto;
}

export class PaginatedInstructorApplicationsResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: PaginatedInstructorApplicationsDataDto, })
    data!: PaginatedInstructorApplicationsDataDto;

    static fromResult(message: string, result: IPaginatedResult<InstructorApplicationEntity>,): PaginatedInstructorApplicationsResponseDto {
        return {
            success: true,
            message,
            data: {
                items: result.items.map(InstructorApplicationDto.fromEntity,),
                meta: PaginationMetaDto.create(
                    result.page,
                    result.limit,
                    result.total,
                ),
            },
        };
    }
}

export class PresignedUploadDataDto {
    @ApiProperty()
    storageKey!: string;

    @ApiProperty()
    uploadUrl!: string;

    @ApiProperty()
    expiresInSeconds!: number;
}

export class PresignedUploadResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: PresignedUploadDataDto, })
    data!: PresignedUploadDataDto;

    static create(upload: {
        key: string;
        uploadUrl: string;
        expiresInSeconds: number;
    }): PresignedUploadResponseDto {
        return {
            success: true,
            message: 'Upload URL created successfully',
            data: {
                storageKey: upload.key,
                uploadUrl: upload.uploadUrl,
                expiresInSeconds: upload.expiresInSeconds,
            },
        };
    }
}

export class PresignedDownloadDataDto {
    @ApiProperty()
    storageKey!: string;

    @ApiProperty()
    viewUrl!: string;

    @ApiProperty()
    expiresInSeconds!: number;
}

export class PresignedDownloadResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: PresignedDownloadDataDto, })
    data!: PresignedDownloadDataDto;

    static create(download: {
        key: string;
        viewUrl: string;
        expiresInSeconds: number;
    }): PresignedDownloadResponseDto {
        return {
            success: true,
            message: 'View URL created successfully',
            data: {
                storageKey: download.key,
                viewUrl: download.viewUrl,
                expiresInSeconds: download.expiresInSeconds,
            },
        };
    }
}