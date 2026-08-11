import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class ConfirmCategoryImageUploadDto {
    @ApiProperty({
        example: 'categories/category-id/images/6e209cf2-92f5-4a3b-aad0-1672da221c5f.webp',
    })
    @IsString()
    @MaxLength(500)
    storageKey!: string;
}