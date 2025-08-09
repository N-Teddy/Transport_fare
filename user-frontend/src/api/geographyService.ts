// src/api/geographyService.ts

import { apiClient } from "../provider/axiosClient";
import { API_ENDPOINTS } from "./apiEndpoints";
import type {
    CityListResponseDto,
    CityQueryDto,
    CityResponseDto,
    RegionListResponseDto,
    RegionQueryDto,
    RegionResponseDto,
    RegionWithCitiesResponseDto,
} from "../types/geography";
import type { ApiResponseDto } from "../types/vehicle";

export const GeographyService = {
    async findAllRegions(query?: RegionQueryDto): Promise<RegionListResponseDto> {
        const response = await apiClient.get<RegionListResponseDto>(
            API_ENDPOINTS.GEOGRAPHY.REGIONS.GET_ALL,
            { params: query });
        return response.data;
    },

    async findRegionById(id: string): Promise<ApiResponseDto<RegionResponseDto>> {
        const response = await apiClient.get<ApiResponseDto<RegionResponseDto>>(
            API_ENDPOINTS.GEOGRAPHY.REGIONS.GET_BY_ID(id));
        return response.data;
    },

    async findRegionWithCities(id: string): Promise<ApiResponseDto<RegionWithCitiesResponseDto>> {
        const response = await apiClient.get<ApiResponseDto<RegionWithCitiesResponseDto>>(
            API_ENDPOINTS.GEOGRAPHY.REGIONS.GET_CITIES_BY_REGION_ID(id));
        return response.data;
    },

    async findAllCities(query?: CityQueryDto): Promise<CityListResponseDto> {
        const response = await apiClient.get<CityListResponseDto>(
            API_ENDPOINTS.GEOGRAPHY.CITIES.GET_ALL, { params: query });
        return response.data;
    },

    async findMajorCities(): Promise<ApiResponseDto<CityResponseDto[]>> {
        const response = await apiClient.get<ApiResponseDto<CityResponseDto[]>>(
            API_ENDPOINTS.GEOGRAPHY.CITIES.GET_MAJOR);
        return response.data;
    },

    async findCityById(id: string): Promise<ApiResponseDto<CityResponseDto>> {
        const response = await apiClient.get<ApiResponseDto<CityResponseDto>>(
            API_ENDPOINTS.GEOGRAPHY.CITIES.GET_BY_ID(id));
        return response.data;
    },

    async findCitiesByRegion(regionId: string): Promise<ApiResponseDto<CityResponseDto[]>> {
        const response = await apiClient.get<ApiResponseDto<CityResponseDto[]>>(
            API_ENDPOINTS.GEOGRAPHY.CITIES.GET_BY_REGION_ID(regionId));
        return response.data;
    },
};