import { ApiProperty } from "@nestjs/swagger/dist/decorators/api-property.decorator"
import { Transform } from "class-transformer"
import { IsEmail, IsString, Length, Matches, MinLength } from "class-validator"

export class RegisterDto {
    @ApiProperty({
        example: "John Doe",
        description: "The full name of the user"
    })
    @Transform(({ value }) => value?.trim())
    @IsString()
    @Length(2, 100)
    @Matches(/^(?=.*\p{L})[\p{L}\s'-]{2,}$/u)
    name!: string

    @ApiProperty({
        example: "user@example.com",
        description: "The email address of the user"
    })
    @Transform(({ value }) => value?.trim().toLowerCase())
    @IsEmail()
    email!: string

    @ApiProperty({
        example: "password123",
        description: "The password of the user. Must be at least 8 characters long."
    })
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)
    password!: string
}