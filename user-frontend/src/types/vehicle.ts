// src/types/vehicle.ts

export type VehicleType = 'TAXI' | 'MOTORCYCLE' | 'TRUCK' | 'VAN' | 'BUS'

export type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'SUSPENDED'

export interface VehicleResponseDto {
    id: string;
    vehicleTypeId: string;
    licensePlate: string;
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    engineCapacity?: number;
    insuranceNumber?: string;
    insuranceExpiry?: Date;
    inspectionExpiry?: Date;
    ownerDriverId?: string;
    registrationDate: Date;
    status: string;
    photosVerified: boolean;
    lastPhotoUpdate?: Date;
    createdAt: Date;
    updatedAt: Date;
    vehicleType: VehicleTypeResponseDto;
    ownerDriver?: any;
}

export interface VehicleTypeResponseDto {
    id: string;
    typeName: VehicleType;
    description?: string;
    maxPassengers?: number;
    requiresHelmet: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateVehicleDto {
    vehicleTypeId: string;
    licensePlate: string;
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    engineCapacity?: number;
    insuranceNumber?: string;
    insuranceExpiry?: string;
    inspectionExpiry?: string;
    ownerDriverId?: string;
}

export interface VehicleCreatedResponseDto {
    id: string;
    licensePlate: string;
    createdAt: Date;
}

export interface VehicleTypeQueryDto {
    page?: number;
    limit?: number;
    typeName?: VehicleType;
    requiresHelmet?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface ApiResponseDto<T> {
    status: 'success' | 'error';
    message: string;
    data: T;
}

export interface PaginatedResponseDto<T> {
    status: 'success' | 'error';
    message: string;
    data: {
        items: T[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    };
}