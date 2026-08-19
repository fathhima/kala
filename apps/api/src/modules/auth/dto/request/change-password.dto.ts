import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class ChangePasswordDto {
    @ApiPropertyOptional({ description: 'Required only when the account already has a password.', })
    @IsOptional()
    @IsString()
    currentPassword?: string

    @ApiProperty({ minLength: 8, maxLength: 50 })
    @IsString()
    @MinLength(8)
    @MaxLength(50)
    newPassword!: string
}