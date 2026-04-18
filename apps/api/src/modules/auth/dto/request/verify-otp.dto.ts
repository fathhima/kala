import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsString, Length } from "class-validator"

export class VerifyOtpDto {

    @ApiProperty({
        example:"user@example.com",
        description:"The email address of the user to verify OTP for"
    })
    @IsEmail()
    email!: string

    @ApiProperty({
        example:"123456",
        description:"The 6-digit OTP sent to the user's email"
    })
    @IsString()
    @Length(6, 6)
    otp!: string
}