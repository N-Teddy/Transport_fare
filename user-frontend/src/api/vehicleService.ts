// src/api/vehicleService.ts

import { apiClient } from "../provider/axiosClient";
import type { ApiResponseDto, CreateVehicleDto, PaginatedResponseDto, VehicleCreatedResponseDto, VehicleResponseDto, VehicleTypeQueryDto, VehicleTypeResponseDto } from "../types/vehicle";
import { API_ENDPOINTS } from "./apiEndpoints";

export const VehicleService = {
    createVehicle: async (createVehicleDto: CreateVehicleDto) => {
        const response = await apiClient.post<ApiResponseDto<VehicleCreatedResponseDto>>(
            API_ENDPOINTS.VEHICLE.CREATE,
            createVehicleDto
        );
        return response.data;
    },

    getVehicle: async ( ownerDriverId: string ) => {
        const response = await apiClient.get<PaginatedResponseDto<VehicleResponseDto>>(
            API_ENDPOINTS.VEHICLE.BASE, { params: {ownerDriverId} }
        );
        console.log(response.headers)
        return response.data;
    },

    getVehicleTypeById: async (id: string) => {
        const response = await apiClient.get<ApiResponseDto<VehicleTypeResponseDto>>(
            API_ENDPOINTS.VEHICLE.VEHICLE_TYPE.GET_BY_ID(id)
        );
        return response.data;
    },

    getAllVehicleTypes: async (query: VehicleTypeQueryDto) => {
        const response = await apiClient.get<PaginatedResponseDto<VehicleTypeResponseDto>>(
            API_ENDPOINTS.VEHICLE.VEHICLE_TYPE.GET_TYPE,
            { params: query }
        );
        return response.data;
    },
};