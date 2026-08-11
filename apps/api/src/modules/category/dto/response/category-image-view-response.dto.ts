import { ApiProperty } from '@nestjs/swagger';

export class CategoryImageViewDataDto {
    @ApiProperty()
    storageKey!: string;

    @ApiProperty()
    viewUrl!: string;

    @ApiProperty({ example: 900 })
    expiresInSeconds!: number;
}

export class CategoryImageViewResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: CategoryImageViewDataDto })
    data!: CategoryImageViewDataDto;

    static create(params: { storageKey: string; viewUrl: string; expiresInSeconds: number; }): CategoryImageViewResponseDto {
        return {
            success: true,
            message: 'Category image view URL created successfully',
            data: params,
        };
    }
}