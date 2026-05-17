import { ApiProperty } from "@nestjs/swagger"

export class ResendOtpResponseDataDto {
    @ApiProperty()
    expiresIn!: number

    @ApiProperty()
    resendAfter!: number
}

export class ResendOtpResponseDto {
    @ApiProperty()
    success!: boolean

    @ApiProperty()
    message!: string

    @ApiProperty({ type: ResendOtpResponseDataDto })
    data!: ResendOtpResponseDataDto
}