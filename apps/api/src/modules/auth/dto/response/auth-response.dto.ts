// C:\Users\fathi\OneDrive\Desktop\Kala\apps\api\src\modules\auth\dto\response\auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

class SafeUserDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'The unique identifier of the user' })
    id!: string;

    @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
    name!: string;

    @ApiProperty({ example: 'john.doe@example.com', description: 'The email address of the user' })
    email!: string;

    @ApiProperty({ enum: Role, isArray: true, description: 'The roles assigned to the user' })
    roles!: Role[];

    @ApiProperty({ nullable: true, example: 'https://example.com/image.jpg', description: 'The URL of the user\'s profile image' })
    imageUrl!: string | null;

    @ApiProperty({ example: false, description: 'Indicates whether the user has verified their email address' })
    isVerified!: boolean;

    @ApiProperty({ example: true, description: 'Indicates whether the user is active' })
    isActive!: boolean;
}

class AuthDataDto {
    @ApiProperty({ example: 'access_token_example', description: 'The access token for the user' })
    accessToken!: string;

    @ApiProperty({ example: 'refresh_token_example', description: 'The refresh token for the user' })
    refreshToken!: string;

    @ApiProperty({ type: SafeUserDto, description: 'The user information' })
    user!: SafeUserDto;
}

export class AuthResponseDto {
    @ApiProperty({ example: true, description: 'Indicates whether the authentication was successful' })
    success!: boolean;

    @ApiProperty({ example: 'Login successful', description: 'A message describing the result of the authentication attempt' })
    message!: string;

    @ApiProperty({ type: AuthDataDto, description: 'The authentication data' })
    data!: AuthDataDto;
}
