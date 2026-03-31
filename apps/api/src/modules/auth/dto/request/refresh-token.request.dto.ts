import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"

export class RefreshTokenRequestDto {
    @ApiProperty({
        description: "Optional refresh token in body (typically sent via cookie instead)",
        required: false
    })
    @IsString()
    @IsOptional()
    refreshToken?: string
}
