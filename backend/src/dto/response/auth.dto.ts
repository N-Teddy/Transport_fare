import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
    @ApiProperty({ description: 'JWT access token' })
    access_token: string;

    @ApiProperty({ description: 'JWT refresh token' })
    refresh_token: string;

    @ApiProperty({ description: 'Token type' })
    token_type: string;

    @ApiProperty({ description: 'Token expiration time in seconds' })
    expires_in: number;
}

export class UserProfileDto {
    @ApiProperty({ description: 'User ID' })
    id: string;

    @ApiProperty({ description: 'Username' })
    username?: string;

    @ApiProperty({ description: 'Email address' })
    email?: string;

    @ApiProperty({ description: 'First name' })
    firstName: string;

    @ApiProperty({ description: 'Last name' })
    lastName: string;

    @ApiProperty({ description: 'Phone number', required: false })
    phone?: string;

    @ApiProperty({ description: 'User role' })
    role?: string;

    @ApiProperty({ description: 'Region ID', required: false })
    regionId?: string;

    @ApiProperty({ description: 'Account creation date' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    updatedAt: Date;
}

export class AuthResponseDto {
    @ApiProperty({ description: 'Authentication tokens' })
    tokens: TokenResponseDto;

    @ApiProperty({ description: 'User profile information' })
    user: UserProfileDto;
}

export class PasswordResetResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'Reset token sent to email' })
    tokenSent: boolean;
}

export class MessageResponseDto {
    @ApiProperty({ description: 'Response message' })
    message: string;
}
