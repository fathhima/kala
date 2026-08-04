import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsUUID, Matches } from "class-validator"

export class VerifyOtpDto {
    @ApiProperty({
        example: "2f7c8b91-7a8c-4a0d-9c0c-9b0c9b9b0c9b",
        description: "The unique id for a user"
    })
    @IsUUID()
    pendingSignupId!: string

    @ApiProperty({
        example: "123456",
        description: "The 6-digit OTP sent to the user's email"
    })
    @IsString()
    @Matches(/^\d{6}$/, { message: 'OTP must be exactly 6 digits', })
    otp!: string
}