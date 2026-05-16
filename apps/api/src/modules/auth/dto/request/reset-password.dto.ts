import { IsEmail, IsString, Length, MinLength } from "class-validator"

export class ResetPasswordDto {
    @IsEmail()
    token!: string

    @IsString()
    @MinLength(8)
    newPassword!: string
}