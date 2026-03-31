import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty } from "class-validator"

export class GoogleSignInRequestDto {
    @ApiProperty({
        example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ...",
        description: "The Google ID token obtained from the frontend @react-oauth/google"
    })
    @IsString()
    @IsNotEmpty()
    idToken: string
}
