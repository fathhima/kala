import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Max, Min } from 'class-validator';
import { CATEGORY_IMAGE_MIME_TYPES } from '../../constants/image-mime-types';

export class RequestCategoryImageUploadDto {
    @ApiProperty({
        enum: CATEGORY_IMAGE_MIME_TYPES,
        example: 'image/webp',
    })
    @IsIn(CATEGORY_IMAGE_MIME_TYPES)
    mimeType!: (typeof CATEGORY_IMAGE_MIME_TYPES)[number];

    @ApiProperty({
        example: 245120,
        description: 'Image size in bytes; maximum 5 MB.',
    })
    @IsInt()
    @Min(1)
    @Max(5 * 1024 * 1024)
    sizeBytes!: number;
}