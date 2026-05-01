import { ApiProperty } from "@nestjs/swagger"
import { IsEmail } from "class-validator"

export class ResendOtpDto {

    @ApiProperty({
        example:'user@example.com',
        description:'Email address to resend OTP to',
    })
    @IsEmail()
    email!: string
}