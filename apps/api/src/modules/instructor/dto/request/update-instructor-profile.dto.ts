import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateInstructorProfileDto {
    @ApiProperty({ maxLength: 2_000 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2_000)
    bio!: string;

    @ApiProperty({ maxLength: 120 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    location!: string;

    @ApiProperty({ maxLength: 2_000 })
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    @MaxLength(2_000)
    portfolioUrl!: string;
}