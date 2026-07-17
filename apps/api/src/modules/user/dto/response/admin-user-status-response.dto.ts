import { ApiProperty } from "@nestjs/swagger";
import { UserEntity } from "../../entities/user.entity";

export class AdminUserStatusDataDto {
    @ApiProperty({ example: 'cuid1234' })
    id!: string;

    @ApiProperty({ example: false })
    isActive!: boolean;

    static fromEntity(user: UserEntity): AdminUserStatusDataDto {
        const dto = new AdminUserStatusDataDto();
        dto.id = user.id;
        dto.isActive = user.isActive;
        return dto;
    }
}

export class AdminUserStatusResponseDto {
    @ApiProperty()
    success!: boolean;

    @ApiProperty()
    message!: string;

    @ApiProperty({ type: AdminUserStatusDataDto })
    data!: AdminUserStatusDataDto;

    static fromResult(params: {
        message: string;
        user: UserEntity;
    }): AdminUserStatusResponseDto {
        const dto = new AdminUserStatusResponseDto();

        dto.success = true;
        dto.message = params.message;
        dto.data = AdminUserStatusDataDto.fromEntity(params.user);

        return dto;
    }
}