import { ApiProperty } from "@nestjs/swagger";

export class ResendOtpDataDto {
    @ApiProperty()
    expiresIn!: number;

    @ApiProperty()
    resendAfter!: number;
}

export class ResendOtpResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: ResendOtpDataDto })
    data!: ResendOtpDataDto;

    static fromResult(params: {
        message: string;
        expiresIn: number;
        resendAfter: number;
    }): ResendOtpResponseDto {
        const dto = new ResendOtpResponseDto();

        dto.success = true;
        dto.message = params.message;
        dto.data = {
            expiresIn: params.expiresIn,
            resendAfter: params.resendAfter,
        };

        return dto;
    }
}