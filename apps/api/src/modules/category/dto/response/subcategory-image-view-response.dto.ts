import { ApiProperty } from '@nestjs/swagger';

export class SubcategoryImageViewDataDto {
    @ApiProperty()
    storageKey!: string;

    @ApiProperty()
    viewUrl!: string;

    @ApiProperty({ example: 900 })
    expiresInSeconds!: number;
}

export class SubcategoryImageViewResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: SubcategoryImageViewDataDto })
    data!: SubcategoryImageViewDataDto;

    static create(params: { storageKey: string; viewUrl: string; expiresInSeconds: number; }): SubcategoryImageViewResponseDto {
        return {
            success: true,
            message: 'Subcategory image view URL created successfully',
            data: params,
        };
    }
}