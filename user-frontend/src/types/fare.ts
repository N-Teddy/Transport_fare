// src/types/fare.ts

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

export interface FareRateResponseDto {
    id: string;
    vehicleTypeId: string;
    baseFare: number;
    perKmRate: number;
    nightMultiplier: number;
    effectiveFrom: Date;
    effectiveUntil?: Date;
    isActive: boolean;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RegionalFareMultiplierResponseDto {
    id: string;
    regionId: string;
    regionName?: string;
    multiplier: number;
    effectiveFrom: Date;
    effectiveUntil?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface RegionalMultiplierListResponseDto {
    data: RegionalFareMultiplierResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface FareRateQueryDto {
    page?: number;
    limit?: number;
    vehicleTypeId?: string;
    isActive?: boolean;
    effectiveDate?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface RegionalMultiplierQueryDto {
    page?: number;
    limit?: number;
    regionId?: string;
    isActive?: boolean;
    effectiveDate?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}