import { ApiProperty } from '@nestjs/swagger';

export class CategoryImageUploadDataDto {
    @ApiProperty()
    storageKey!: string;

    @ApiProperty()
    uploadUrl!: string;

    @ApiProperty({ example: 300 })
    expiresInSeconds!: number;
}

export class CategoryImageUploadResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: CategoryImageUploadDataDto })
    data!: CategoryImageUploadDataDto;

    static create(params: { storageKey: string; uploadUrl: string; expiresInSeconds: number; }): CategoryImageUploadResponseDto {
        return {
            success: true,
            message: 'Category image upload URL created successfully',
            data: params,
        };
    }
}