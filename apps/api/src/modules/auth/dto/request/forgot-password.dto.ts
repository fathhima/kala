import { ApiProperty } from "@nestjs/swagger"
import { IsEmail } from "class-validator"

export class ForgotPasswordDto {
    @ApiProperty({
        example: "user@example.com",
        description: "The email address of the user trying to log in"
    })
    @IsEmail()
    email!: string
}