import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetaDto } from '@/shared/dto/response/pagination-meta.dto';
import { PaginatedResult } from '@/shared/types';
import { InstructorApplicationEntity, InstructorOfferingEntity, InstructorProfileEntity, OfferingMediaEntity, } from '../../entities/instructor-profile.entity';

export class OfferingMediaDto {
    @ApiProperty() id!: string;
    @ApiProperty() type!: string;
    @ApiProperty() storageKey!: string;
    @ApiProperty() mimeType!: string;
    @ApiProperty() sizeBytes!: number;
    @ApiProperty() sortOrder!: number;
    @ApiProperty() createdAt!: Date;

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

export class InstructorOfferingDto {
    @ApiProperty() id!: string;
    @ApiProperty() subcategoryId!: string;
    @ApiPropertyOptional() title?: string | null;
    @ApiPropertyOptional() description?: string | null;
    @ApiProperty() hourlyRate!: string;
    @ApiProperty() currency!: string;
    @ApiPropertyOptional() experienceYears?: number | null;
    @ApiProperty() status!: string;
    @ApiPropertyOptional() reviewNote?: string | null;
    @ApiProperty({ type: [OfferingMediaDto] }) media!: OfferingMediaDto[];
    @ApiProperty() subcategory!: object;

    static fromEntity(entity: InstructorOfferingEntity): InstructorOfferingDto {
        return {
            id: entity.id,
            subcategoryId: entity.subcategoryId,
            title: entity.title,
            description: entity.description,
            hourlyRate: entity.hourlyRate,
            currency: entity.currency,
            experienceYears: entity.experienceYears,
            status: entity.status,
            reviewNote: entity.reviewNote,
            media: entity.media.map(OfferingMediaDto.fromEntity),
            subcategory: entity.subcategory,
        };
    }
}

export class InstructorApplicationDto {
    @ApiProperty() id!: string;
    @ApiProperty() status!: string;
    @ApiProperty() submittedAt!: Date;
    @ApiPropertyOptional() reviewedAt?: Date | null;
    @ApiPropertyOptional() reviewedBy?: string | null;
    @ApiProperty({ type: [InstructorOfferingDto] })
    offerings!: InstructorOfferingDto[];
    @ApiPropertyOptional() profile?: object;

    static fromEntity(entity: InstructorApplicationEntity): InstructorApplicationDto {
        return {
            id: entity.id,
            status: entity.status,
            submittedAt: entity.submittedAt,
            reviewedAt: entity.reviewedAt,
            reviewedBy: entity.reviewedBy,
            offerings: entity.offerings.map(InstructorOfferingDto.fromEntity),
            profile: entity.profile,
        };
    }
}

export class InstructorProfileDto {
    @ApiProperty() id!: string;
    @ApiProperty() userId!: string;
    @ApiPropertyOptional() bio?: string | null;
    @ApiPropertyOptional() location?: string | null;
    @ApiProperty() status!: string;
    @ApiProperty({ type: [InstructorOfferingDto] })
    offerings!: InstructorOfferingDto[];
    @ApiPropertyOptional({ type: InstructorApplicationDto })
    latestApplication?: InstructorApplicationDto | null;

    static fromEntity(entity: InstructorProfileEntity): InstructorProfileDto {
        return {
            id: entity.id,
            userId: entity.userId,
            bio: entity.bio,
            location: entity.location,
            status: entity.status,
            offerings: entity.offerings.map(InstructorOfferingDto.fromEntity),
            latestApplication: entity.latestApplication
                ? InstructorApplicationDto.fromEntity(entity.latestApplication)
                : null,
        };
    }
}

export class InstructorProfileResponseDto {
    @ApiProperty() success!: boolean;
    @ApiProperty() message!: string;
    @ApiPropertyOptional({ type: InstructorProfileDto })
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
    @ApiProperty() success!: boolean;
    @ApiProperty() message!: string;
    @ApiProperty({ type: InstructorOfferingDto }) data!: InstructorOfferingDto;

    static fromEntity(message: string, entity: InstructorOfferingEntity,): InstructorOfferingResponseDto {
        return { success: true, message, data: InstructorOfferingDto.fromEntity(entity) };
    }
}

export class OfferingMediaResponseDto {
    @ApiProperty() success!: boolean;
    @ApiProperty() message!: string;
    @ApiProperty({ type: OfferingMediaDto }) data!: OfferingMediaDto;

    static fromEntity(message: string, entity: OfferingMediaEntity,): OfferingMediaResponseDto {
        return { success: true, message, data: OfferingMediaDto.fromEntity(entity) };
    }
}

export class InstructorApplicationResponseDto {
    @ApiProperty() success!: boolean;
    @ApiProperty() message!: string;
    @ApiProperty({ type: InstructorApplicationDto }) data!: InstructorApplicationDto;

    static fromEntity(message: string, entity: InstructorApplicationEntity,): InstructorApplicationResponseDto {
        return {
            success: true,
            message,
            data: InstructorApplicationDto.fromEntity(entity),
        };
    }
}

export class PaginatedInstructorApplicationsResponseDto {
    @ApiProperty() success!: boolean;
    @ApiProperty() message!: string;
    @ApiProperty() data!: {
        items: InstructorApplicationDto[];
        meta: PaginationMetaDto;
    };

    static fromResult(message: string, result: PaginatedResult<InstructorApplicationEntity>,)
        : PaginatedInstructorApplicationsResponseDto {
        return {
            success: true,
            message,
            data: {
                items: result.items.map(InstructorApplicationDto.fromEntity),
                meta: PaginationMetaDto.create(result.page, result.limit, result.total),
            },
        };
    }
}

export class PresignedUploadResponseDto {
    @ApiProperty() success!: boolean;
    @ApiProperty() message!: string;
    @ApiProperty() data!: {
        storageKey: string;
        uploadUrl: string;
        expiresInSeconds: number;
    };

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

export class PresignedDownloadResponseDto {
    @ApiProperty() success!: boolean;
    @ApiProperty() message!: string;
    @ApiProperty() data!: {
        storageKey: string;
        viewUrl: string;
        expiresInSeconds: number;
    };

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