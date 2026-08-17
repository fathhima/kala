import { MediaType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsInt, Max, Min } from 'class-validator';

export const OFFERING_MEDIA_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm',] as const;

export class RequestOfferingMediaUploadDto {
    @ApiProperty({ enum: MediaType })
    @IsEnum(MediaType)
    type!: MediaType;

    @ApiProperty({ enum: OFFERING_MEDIA_MIME_TYPES })
    @IsIn(OFFERING_MEDIA_MIME_TYPES)
    mimeType!: (typeof OFFERING_MEDIA_MIME_TYPES)[number];

    @ApiProperty({ example: 524288 })
    @IsInt()
    @Min(1)
    @Max(100 * 1024 * 1024)
    sizeBytes!: number;

    @ApiProperty({ example: 0 })
    @IsInt()
    @Min(0)
    @Max(100)
    sortOrder!: number;
}