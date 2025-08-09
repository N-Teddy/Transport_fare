// src/api/driverService.ts

import { apiClient } from "../provider/axiosClient";
import type { ApiResponseDto, CreateDriverDto, DriverCreatedResponseDto, DriverRatingResponseDto, DriverResponseDto, DriverUpdatedResponseDto } from "../types/driver";
import { API_ENDPOINTS } from "./apiEndpoints";


export const DriverService = {
    createDriver: async (createDriverDto: CreateDriverDto) => {
        const response = await apiClient.post<ApiResponseDto<DriverCreatedResponseDto>>(
            API_ENDPOINTS.DRIVERS.CREATE,
            createDriverDto
        );
        return response.data;
    },

    getDriverById: async (id: string) => {
        const response = await apiClient.get<ApiResponseDto<DriverResponseDto>>(
            API_ENDPOINTS.DRIVERS.GET_BY_ID(id)
        );
        return response.data;
    },

    updateDriver: async (id: string, updateDriverDto: Partial<CreateDriverDto>) => {
        const response = await apiClient.patch<ApiResponseDto<DriverUpdatedResponseDto>>(
            API_ENDPOINTS.DRIVERS.UPDATE(id),
            updateDriverDto
        );
        return response.data;
    },

    verifyDriverPhotos: async (id: string) => {
        const response = await apiClient.post<ApiResponseDto<DriverResponseDto>>(
            API_ENDPOINTS.DRIVERS.VERIFY_PHOTOS(id)
        );
        return response.data;
    },

    getDriverRating: async (id: string) => {
        const response = await apiClient.get<ApiResponseDto<DriverRatingResponseDto>>(
            API_ENDPOINTS.DRIVERS.RATINGS.GET_BY_ID(id)
        );
        return response.data;
    },
};