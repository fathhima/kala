import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsInt, Max, Min } from 'class-validator';
import { MediaType } from '../../enums/instructor.enum';
import { OFFERING_MEDIA_MIME_TYPES } from '../../constants/media-mime-types';

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