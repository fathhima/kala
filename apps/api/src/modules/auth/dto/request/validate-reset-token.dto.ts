import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ValidateResetTokenDto {
    @ApiProperty({
        example: "secrettoken",
        description: "The token send with the email"
    })
    @IsString()
    token!: string;
}