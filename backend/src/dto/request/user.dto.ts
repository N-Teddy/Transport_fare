import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
    Matches,
    IsEnum,
    IsNumber,
    IsBoolean,
    IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRoleEnum } from 'src/common/enum/global.enum';

export class CreateUserDto {
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

    @ApiProperty({ description: 'User role', enum: UserRoleEnum, required: false })
    @IsOptional()
    @IsEnum(UserRoleEnum)
    role?: string;

    @ApiProperty({ description: 'Region ID', required: false })
    @IsOptional()
    @IsUUID()
    regionId?: string;

    @ApiProperty({ description: 'Whether user is active', required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UpdateUserDto {
    @ApiProperty({ description: 'Username', required: false })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores',
    })
    username?: string;

    @ApiProperty({ description: 'User first name', required: false })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({ description: 'User last name', required: false })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ description: 'User email address', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ description: 'User phone number', required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ description: 'User role', enum: UserRoleEnum, required: false })
    @IsOptional()
    @IsEnum(UserRoleEnum)
    role?: string;

    @ApiProperty({ description: 'Region ID', required: false })
    @IsOptional()
    @IsUUID()
    regionId?: string;

    @ApiProperty({ description: 'Whether user is active', required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class ChangeUserPasswordDto {
    @ApiProperty({ description: 'New password' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    newPassword: string;
}

export class UserQueryDto {
    @ApiProperty({ description: 'Search by username', required: false })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiProperty({ description: 'Search by email', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ description: 'Filter by role', enum: UserRoleEnum, required: false })
    @IsOptional()
    @IsEnum(UserRoleEnum)
    role?: string;

    @ApiProperty({ description: 'Filter by region ID', required: false })
    @IsOptional()
    @IsUUID()
    regionId?: string;

    @ApiProperty({ description: 'Filter by active status', required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({ description: 'Page number', required: false, default: 1 })
    @IsOptional()
    @IsNumber()
    page?: number = 1;

    @ApiProperty({ description: 'Items per page', required: false, default: 10 })
    @IsOptional()
    @IsNumber()
    limit?: number = 10;
}
