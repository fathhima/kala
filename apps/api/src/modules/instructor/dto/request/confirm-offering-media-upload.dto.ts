import { MediaType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString, Max, MaxLength, Min } from 'class-validator';

export class ConfirmOfferingMediaUploadDto {
    @ApiProperty({ enum: MediaType })
    @IsEnum(MediaType)
    type!: MediaType;

    @ApiProperty()
    @IsString()
    @MaxLength(500)
    storageKey!: string;

    @ApiProperty()
    @IsInt()
    @Min(0)
    @Max(100)
    sortOrder!: number;
}