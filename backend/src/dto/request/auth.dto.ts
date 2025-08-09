import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
    Matches,
    IsUUID,
    IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ description: 'Username or email for login' })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ description: 'User password' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;
}

export class RegisterDto {
    @ApiProperty({ description: 'Unique username' })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores',
    })
    username: string;

    @ApiProperty({ description: 'User email address' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'User password' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ description: 'User first name' })
    @IsNotEmpty()
    @IsString()
    firstName: string;

    @ApiProperty({ description: 'User last name' })
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty({ description: 'User phone number', required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ description: 'User role', required: false })
    @IsOptional()
    @IsString()
    role?: string;

    @ApiProperty({ description: 'Region ID', required: false })
    @IsOptional()
    @IsUUID()
    regionId?: string;
}

export class ForgotPasswordDto {
    @ApiProperty({ description: 'User email address' })
    @IsNotEmpty()
    @IsEmail()
    email: string;
}

export class ResetPasswordDto {
    @ApiProperty({ description: 'Reset token' })
    @IsNotEmpty()
    @IsString()
    token: string;

    @ApiProperty({ description: 'New password' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    newPassword: string;
}

export class ChangePasswordDto {
    @ApiProperty({ description: 'Current password' })
    @IsNotEmpty()
    @IsString()
    currentPassword: string;

    @ApiProperty({ description: 'New password' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    newPassword: string;
}

export class RefreshTokenDto {
    @ApiProperty({ description: 'Refresh token' })
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}

export class DriverLoginDto {
    @ApiProperty({
        description: 'Phone number of the driver',
        example: '+2376XXXXXXXX',
    })
    @IsPhoneNumber()
    @IsNotEmpty()
    phoneNumber: string;
}

export class VerifyOtpDto {
    @ApiProperty({
        description: 'Phone number of the driver',
        example: '+2376XXXXXXXX',
    })
    @IsPhoneNumber()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({
        description: 'One-time password sent to the driver',
        example: '123456',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    otp: string;
}
