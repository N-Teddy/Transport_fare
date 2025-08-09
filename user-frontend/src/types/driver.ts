// src/types/driver.ts
export type DriverStatusEnum = 'ACTIVE' | 'INACTIVE '| 'SUSPENDED' | 'PENDING'


export interface CreateDriverDto {
    licenseNumber: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    cniNumber: string;
    birthDate?: string;
    address?: string;
    cityId: string;
    driverLicenseExpiry?: Date;
    healthCertificateExpiry?: Date;
    status?: DriverStatusEnum;
    photosVerified?: boolean;
}

export interface DriverResponseDto {
    id: string;
    licenseNumber: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    cniNumber: string;
    birthDate?: Date;
    address?: string;
    cityId: string;
    cityName?: string;
    driverLicenseExpiry?: Date;
    healthCertificateExpiry?: Date;
    registrationDate: Date;
    status: string;
    photosVerified: boolean;
    lastPhotoUpdate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface DriverCreatedResponseDto extends DriverResponseDto { }
export interface DriverUpdatedResponseDto extends DriverResponseDto { }

export interface DriverRatingResponseDto {
    id: string;
    driverId: string;
    averageRating: number;
    totalRatings: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ApiResponseDto<T> {
    status: 'success' | 'error';
    message: string;
    data: T;
}