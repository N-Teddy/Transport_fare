import { ApiProperty } from '@nestjs/swagger';

// Driver Response DTOs
export class DriverResponseDto {
    @ApiProperty({ description: 'Driver ID' })
    id: string;

    @ApiProperty({ description: 'Driver license number' })
    licenseNumber: string;

    @ApiProperty({ description: 'Driver first name' })
    firstName: string;

    @ApiProperty({ description: 'Driver last name' })
    lastName: string;

    @ApiProperty({ description: 'Driver phone number' })
    phoneNumber: string;

    @ApiProperty({ description: 'Cameroon National ID number' })
    cniNumber: string;

    @ApiProperty({ description: 'Driver birth date', required: false })
    birthDate?: Date;

    @ApiProperty({ description: 'Driver address', required: false })
    address?: string;

    @ApiProperty({ description: 'City ID where driver operates' })
    cityId: string;

    @ApiProperty({ description: 'City name', required: false })
    cityName?: string;

    @ApiProperty({ description: 'Driver license expiry date', required: false })
    driverLicenseExpiry?: Date;

    @ApiProperty({ description: 'Health certificate expiry date', required: false })
    healthCertificateExpiry?: Date;

    @ApiProperty({ description: 'Driver registration date' })
    registrationDate: Date;

    @ApiProperty({ description: 'Driver status' })
    status: string;

    @ApiProperty({ description: 'Whether driver photos are verified' })
    photosVerified: boolean;

    @ApiProperty({ description: 'Last photo update', required: false })
    lastPhotoUpdate?: Date;

    @ApiProperty({ description: 'Created at' })
    createdAt: Date;

    @ApiProperty({ description: 'Updated at' })
    updatedAt: Date;
}

export class DriverListResponseDto {
    @ApiProperty({ description: 'List of drivers', type: [DriverResponseDto] })
    drivers: DriverResponseDto[];

    @ApiProperty({ description: 'Total number of drivers' })
    total: number;

    @ApiProperty({ description: 'Current page' })
    page: number;

    @ApiProperty({ description: 'Items per page' })
    limit: number;

    @ApiProperty({ description: 'Total number of pages' })
    totalPages: number;
}

export class DriverCreatedResponseDto extends DriverResponseDto {}

export class DriverUpdatedResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'Updated driver data' })
    driver: DriverResponseDto;
}

export class DriverDeletedResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'Deleted driver ID' })
    driverId: string;
}

// Driver Rating Response DTOs
export class DriverRatingResponseDto {
    @ApiProperty({ description: 'Driver rating ID' })
    id: string;

    @ApiProperty({ description: 'Trip ID' })
    tripId: string;

    @ApiProperty({ description: 'Driver ID' })
    driverId: string;

    @ApiProperty({ description: 'Driver name', required: false })
    driverName?: string;

    @ApiProperty({ description: 'Driver license number', required: false })
    driverLicenseNumber?: string;

    @ApiProperty({ description: 'Passenger phone', required: false })
    passengerPhone?: string;

    @ApiProperty({ description: 'Rating (1-5)' })
    rating: number;

    @ApiProperty({ description: 'Rating comment', required: false })
    comment?: string;

    @ApiProperty({ description: 'Category ratings', required: false, type: 'string' })
    categories?: Record<string, number>;

    @ApiProperty({ description: 'Created at' })
    createdAt: Date;

    @ApiProperty({ description: 'Updated at' })
    updatedAt: Date;
}

export class DriverRatingListResponseDto {
    @ApiProperty({ description: 'List of driver ratings', type: [DriverRatingResponseDto] })
    ratings: DriverRatingResponseDto[];

    @ApiProperty({ description: 'Total number of ratings' })
    total: number;

    @ApiProperty({ description: 'Current page' })
    page: number;

    @ApiProperty({ description: 'Items per page' })
    limit: number;

    @ApiProperty({ description: 'Total number of pages' })
    totalPages: number;
}

export class DriverRatingCreatedResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'Created driver rating data' })
    rating: DriverRatingResponseDto;
}

export class DriverRatingUpdatedResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'Updated driver rating data' })
    rating: DriverRatingResponseDto;
}

export class DriverRatingDeletedResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'Deleted driver rating ID' })
    ratingId: string;
}

// Driver Statistics DTOs
export class DriverStatsResponseDto {
    @ApiProperty({ description: 'Total number of drivers' })
    totalDrivers: number;

    @ApiProperty({ description: 'Number of active drivers' })
    activeDrivers: number;

    @ApiProperty({ description: 'Number of suspended drivers' })
    suspendedDrivers: number;

    @ApiProperty({ description: 'Number of revoked drivers' })
    revokedDrivers: number;

    @ApiProperty({ description: 'Number of drivers with verified photos' })
    verifiedPhotos: number;

    @ApiProperty({ description: 'Number of drivers with unverified photos' })
    unverifiedPhotos: number;

    @ApiProperty({ description: 'Number of drivers with expiring licenses (within 30 days)' })
    expiringLicenses: number;

    @ApiProperty({ description: 'Number of drivers with expired licenses' })
    expiredLicenses: number;

    @ApiProperty({ description: 'Average driver rating' })
    averageRating: number;

    @ApiProperty({ description: 'Total number of ratings' })
    totalRatings: number;
}

export class DriverRatingStatsResponseDto {
    @ApiProperty({ description: 'Driver ID' })
    driverId: string;

    @ApiProperty({ description: 'Total number of ratings' })
    totalRatings: number;

    @ApiProperty({ description: 'Average rating' })
    averageRating: number;

    @ApiProperty({ description: 'Rating distribution (1-5)', type: 'string' })
    ratingDistribution: Record<string, number>;

    @ApiProperty({ description: 'Category averages', type: 'string' })
    categoryAverages: Record<string, number>;
}

// GPS Tracking Log Response DTO
export class GpsTrackingLogResponseDto {
    id: string;
    tripId: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    timestamp: string;
    createdAt: string;
    updatedAt: string;
}
