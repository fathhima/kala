import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDto {
    @ApiProperty({ example: '12345678', minLength: 8, maxLength: 50 })
    @IsString()
    @MinLength(8)
    @MaxLength(50)
    password: string;

    @ApiProperty({ example: '12345678', minLength: 8, maxLength: 50 })
    @IsString()
    @MinLength(8)
    @MaxLength(50)
    newPassword: string
} 
