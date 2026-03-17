import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsString, MinLength } from "class-validator"

export class LoginDto {
    @ApiProperty({
        example: "john.doe@example.com",
        description: "The email address of the user trying to log in"
    })
    @IsEmail()
    email: string

    @ApiProperty({
        example: "password123",
        description: "The password of the user trying to log in. Must be at least 8 characters long."
    })
    @IsString()
    @MinLength(8)
    password: string
}