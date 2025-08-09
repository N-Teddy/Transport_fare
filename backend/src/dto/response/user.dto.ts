import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty({ description: 'User ID' })
    id: string;

    @ApiProperty({ description: 'Username' })
    username: string;

    @ApiProperty({ description: 'Email address' })
    email: string;

    @ApiProperty({ description: 'First name' })
    firstName: string;

    @ApiProperty({ description: 'Last name' })
    lastName: string;

    @ApiProperty({ description: 'Phone number', required: false })
    phone?: string;

    @ApiProperty({ description: 'User role' })
    role: string;

    @ApiProperty({ description: 'Region ID', required: false })
    regionId?: string;

    @ApiProperty({ description: 'Whether user is active' })
    isActive: boolean;

    @ApiProperty({ description: 'Account creation date' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    updatedAt: Date;

    @ApiProperty({ description: 'User who created this account', required: false })
    createdBy?: string;
}

export class UserListResponseDto {
    @ApiProperty({ description: 'List of users', type: [UserResponseDto] })
    users: UserResponseDto[];

    @ApiProperty({ description: 'Total number of users' })
    total: number;

    @ApiProperty({ description: 'Current page' })
    page: number;

    @ApiProperty({ description: 'Items per page' })
    limit: number;

    @ApiProperty({ description: 'Total number of pages' })
    totalPages: number;
}

export class UserStatsResponseDto {
    @ApiProperty({ description: 'Total number of users' })
    totalUsers: number;

    @ApiProperty({ description: 'Number of active users' })
    activeUsers: number;

    @ApiProperty({ description: 'Number of inactive users' })
    inactiveUsers: number;

    @ApiProperty({ description: 'Users by role' })
    usersByRole: Record<string, number>;

    @ApiProperty({ description: 'Users by region' })
    usersByRegion: Record<string, number>;
}

export class UserCreatedResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'Created user data' })
    user: UserResponseDto;
}

export class UserUpdatedResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'Updated user data' })
    user: UserResponseDto;
}

export class UserDeletedResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'Deleted user ID' })
    userId: string;
}

export class UserPasswordChangedResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'User ID' })
    userId: string;
}
