import { ApiProperty } from "@nestjs/swagger"
import { IsString, Matches, MinLength } from "class-validator"

export class ResetPasswordDto {
    @ApiProperty({
        example: "secrettoken",
        description: "The token send with the email"
    })
    @IsString()
    token!: string

    @ApiProperty({
        example: "password123",
        description: "The password of the user. Must be at least 8 characters long."
    })
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
    @IsString()
    @MinLength(8)
    newPassword!: string
}