import { ApiProperty } from '@nestjs/swagger';

export class SubcategoryImageUploadDataDto {
    @ApiProperty()
    storageKey!: string;

    @ApiProperty()
    uploadUrl!: string;

    @ApiProperty({ example: 300 })
    expiresInSeconds!: number;
}

export class SubcategoryImageUploadResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: SubcategoryImageUploadDataDto })
    data!: SubcategoryImageUploadDataDto;

    static create(params: { storageKey: string; uploadUrl: string; expiresInSeconds: number; }): SubcategoryImageUploadResponseDto {
        return {
            success: true,
            message: 'Subcategory image upload URL created successfully',
            data: params,
        };
    }
}