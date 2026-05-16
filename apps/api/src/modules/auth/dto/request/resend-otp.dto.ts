import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class ResendOtpDto {
    @ApiProperty({
        example: "2f7c8b91-7a8c-4a0d-9c0c-9b0c9b9b0c9b",
        description: "The unique id for a user",
    })
    @IsString()
    pendingSignupId!: string
}