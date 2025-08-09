// src/types/geography.ts

import type { PaginatedResponseDto } from "./vehicle";


export interface CityResponseDto {
    id: string;
    name: string;
    regionId: string;
    regionName: string;
    regionCode: string;
    isMajorCity: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface RegionResponseDto {
    id: string;
    name: string;
    code: string;
    capitalCity?: string;
    cityCount: number;
    createdAt: Date;
    updatedAt: Date;
}

// Inferred from @ApiQuery decorators
export interface CityQueryDto {
    page?: number;
    limit?: number;
    name?: string;
    regionId?: string;
    isMajorCity?: 'true' | 'false';
}

// Inferred from @ApiQuery decorators
export interface RegionQueryDto {
    page?: number;
    limit?: number;
    name?: string;
    code?: string;
}

// Confirmed DTO for a region including its cities
export interface RegionWithCitiesResponseDto extends RegionResponseDto {
    cities: CityResponseDto[];
}

export interface ApiResponseDto<T> {
    status: 'success' | 'error';
    message: string;
    data: T;
}

export interface CityListResponseDto extends ApiResponseDto<{
    items: CityResponseDto[];
    pagination: PaginatedResponseDto<CityResponseDto>['data']['pagination'];
}> { }

export interface RegionListResponseDto extends ApiResponseDto<{
    items: RegionResponseDto[];
    pagination: PaginatedResponseDto<RegionResponseDto>['data']['pagination'];
}> { }