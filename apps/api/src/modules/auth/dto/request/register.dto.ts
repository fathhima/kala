import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator"
import { IsEmail, IsString, MinLength } from "class-validator"

export class RegisterDto {
    @ApiProperty({
        example: "John Doe",
        description: "The full name of the user"
    })
    @IsString()
    name!: string

    @ApiProperty({
        example: "john.doe@example.com",
        description: "The email address of the user"
    })
    @IsEmail()
    email!: string

    @ApiProperty({
        example: "password123",
        description: "The password of the user. Must be at least 8 characters long."
    })
    @IsString()
    @MinLength(8)
    password!: string
}