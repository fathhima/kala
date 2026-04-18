import { ApiProperty } from "@nestjs/swagger"


export class MessageResponseDto {
    @ApiProperty({ example: true })
    success: boolean

    @ApiProperty({ example: "OTP sent to email" })
    message: string
}