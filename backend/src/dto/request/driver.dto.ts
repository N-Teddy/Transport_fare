import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNumber,
    IsDate,
    IsOptional,
    IsBoolean,
    IsEnum,
    Min,
    Max,
    IsUUID,
    IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DriverStatusEnum } from '../../common/enum/status.enum';

// Driver Request DTOs
export class CreateDriverDto {
    @ApiProperty({ description: 'Driver license number', example: 'DL123456789' })
    @IsString()
    licenseNumber: string;

    @ApiProperty({ description: 'Driver first name', example: 'John' })
    @IsString()
    firstName: string;

    @ApiProperty({ description: 'Driver last name', example: 'Doe' })
    @IsString()
    lastName: string;

    @ApiProperty({ description: 'Driver phone number', example: '+237612345678' })
    @IsString()
    phoneNumber: string;

    @ApiProperty({ description: 'Cameroon National ID number', example: '123456789012' })
    @IsString()
    cniNumber: string;

    @ApiProperty({ description: 'Driver birth date', example: '1990-01-01' })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    birthDate?: Date;

    @ApiProperty({ description: 'Driver address', example: '123 Main Street, Douala' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ description: 'City ID where driver operates' })
    @IsNotEmpty()
    @IsUUID()
    cityId: string;

    @ApiProperty({ description: 'Driver license expiry date', example: '2025-12-31' })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    driverLicenseExpiry?: Date;

    @ApiProperty({ description: 'Health certificate expiry date', example: '2025-12-31' })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    healthCertificateExpiry?: Date;

    @ApiProperty({ description: 'Driver status', enum: DriverStatusEnum, example: 'active' })
    @IsOptional()
    @IsEnum(DriverStatusEnum)
    status?: string;

    @ApiProperty({ description: 'Whether driver photos are verified', example: false })
    @IsOptional()
    @IsBoolean()
    photosVerified?: boolean;
}

export class UpdateDriverDto {
    @ApiProperty({ description: 'Driver license number', example: 'DL123456789' })
    @IsOptional()
    @IsString()
    licenseNumber?: string;

    @ApiProperty({ description: 'Driver first name', example: 'John' })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({ description: 'Driver last name', example: 'Doe' })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ description: 'Driver phone number', example: '+237612345678' })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiProperty({ description: 'Cameroon National ID number', example: '123456789012' })
    @IsOptional()
    @IsString()
    cniNumber?: string;

    @ApiProperty({ description: 'Driver birth date', example: '1990-01-01' })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    birthDate?: Date;

    @ApiProperty({ description: 'Driver address', example: '123 Main Street, Douala' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ description: 'City ID where driver operates', required: false })
    @IsOptional()
    @IsUUID()
    cityId?: string;

    @ApiProperty({ description: 'Driver license expiry date', example: '2025-12-31' })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    driverLicenseExpiry?: Date;

    @ApiProperty({ description: 'Health certificate expiry date', example: '2025-12-31' })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    healthCertificateExpiry?: Date;

    @ApiProperty({ description: 'Driver status', enum: DriverStatusEnum, example: 'active' })
    @IsOptional()
    @IsEnum(DriverStatusEnum)
    status?: string;

    @ApiProperty({ description: 'Whether driver photos are verified', example: false })
    @IsOptional()
    @IsBoolean()
    photosVerified?: boolean;
}

export class DriverQueryDto {
    @ApiProperty({ description: 'Page number', example: 1, required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number;

    @ApiProperty({ description: 'Items per page', example: 10, required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number;

    @ApiProperty({ description: 'Search by license number', example: 'DL123', required: false })
    @IsOptional()
    @IsString()
    licenseNumber?: string;

    @ApiProperty({ description: 'Search by first name', example: 'John', required: false })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({ description: 'Search by last name', example: 'Doe', required: false })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ description: 'Search by phone number', example: '+237612', required: false })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiProperty({ description: 'Search by CNI number', example: '123456', required: false })
    @IsOptional()
    @IsString()
    cniNumber?: string;

    @ApiProperty({ description: 'Filter by city ID', required: false })
    @IsOptional()
    @IsUUID()
    cityId?: string;

    @ApiProperty({
        description: 'Filter by driver status',
        enum: DriverStatusEnum,
        required: false,
    })
    @IsOptional()
    @IsEnum(DriverStatusEnum)
    status?: string;

    @ApiProperty({
        description: 'Filter by photos verification status',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    photosVerified?: boolean;

    @ApiProperty({
        description: 'Filter by license expiry status',
        example: 'expired',
        required: false,
    })
    @IsOptional()
    @IsString()
    licenseExpiryStatus?: 'valid' | 'expired' | 'expiring_soon';

    @ApiProperty({
        description: 'Filter by health certificate expiry status',
        example: 'expired',
        required: false,
    })
    @IsOptional()
    @IsString()
    healthCertificateExpiryStatus?: 'valid' | 'expired' | 'expiring_soon';
}

// Driver Rating Request DTOs
export class CreateDriverRatingDto {
    @ApiProperty({ description: 'Driver ID' })
    @IsNotEmpty()
    @IsUUID()
    driverId: string;

    @ApiProperty({
        description: 'Passenger phone number',
        example: '+237612345678',
        required: false,
    })
    @IsOptional()
    @IsString()
    passengerPhone?: string;

    @ApiProperty({ description: 'Rating (1-5)', example: 5 })
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;

    @ApiProperty({ description: 'Rating comment', example: 'Great service!', required: false })
    @IsOptional()
    @IsString()
    comment?: string;

    @ApiProperty({
        description: 'Category ratings',
        example: { safety: 5, punctuality: 4, vehicle_condition: 5 },
        required: false,
    })
    @IsOptional()
    categories?: {
        safety?: number;
        punctuality?: number;
        vehicle_condition?: number;
        cleanliness?: number;
        communication?: number;
    };
}

export class UpdateDriverRatingDto {
    @ApiProperty({ description: 'Rating (1-5)', example: 5, required: false })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(5)
    rating?: number;

    @ApiProperty({ description: 'Rating comment', example: 'Great service!', required: false })
    @IsOptional()
    @IsString()
    comment?: string;

    @ApiProperty({
        description: 'Category ratings',
        example: { safety: 5, punctuality: 4, vehicle_condition: 5 },
        required: false,
    })
    @IsOptional()
    categories?: {
        safety?: number;
        punctuality?: number;
        vehicle_condition?: number;
        cleanliness?: number;
        communication?: number;
    };

    @ApiProperty({ description: 'Driver ID', required: false })
    @IsOptional()
    @IsUUID()
    driverId?: string;
}

export class DriverRatingQueryDto {
    @ApiProperty({ description: 'Page number', example: 1, required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number;

    @ApiProperty({ description: 'Items per page', example: 10, required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number;

    @ApiProperty({
        description: 'Filter by driver ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
        required: false,
    })
    @IsOptional()
    @IsUUID()
    driverId?: string;

    // @ApiProperty({ description: 'Filter by trip ID', example: 'trip-uuid-123', required: false })
    // @IsOptional()
    // @IsUUID()
    // tripId?: string;

    @ApiProperty({ description: 'Filter by passenger phone', example: '+237612', required: false })
    @IsOptional()
    @IsString()
    passengerPhone?: string;

    @ApiProperty({ description: 'Filter by minimum rating', example: 4, required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(5)
    minRating?: number;

    @ApiProperty({ description: 'Filter by maximum rating', example: 5, required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(5)
    maxRating?: number;

    @ApiProperty({ description: 'Filter by specific rating', example: 5, required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(5)
    rating?: number;
}
