// src/api/tripService.ts

import { apiClient } from "../provider/axiosClient";
import type { ApiResponseDto } from "../types/driver";
import type { AddGpsLogDto, AddGpsLogsDto, CreateTripDto, EndTripDto, GpsLogResponseDto, TripResponseDto } from "../types/trip";
import type { PaginatedResponseDto } from "../types/vehicle";
import { API_ENDPOINTS } from "./apiEndpoints";


export const TripService = {
    createTrip: async (dto: CreateTripDto) => {
        const response = await apiClient.post<ApiResponseDto<TripResponseDto>>(
            API_ENDPOINTS.TRIP.CREATE,
            dto
        );
        return response.data;
    },

    endTrip: async (dto: EndTripDto) => {
        const response = await apiClient.post<ApiResponseDto<TripResponseDto>>(
            API_ENDPOINTS.TRIP.END,
            dto
        );
        return response.data;
    },

    addGpsLog: async (dto: AddGpsLogDto) => {
        const response = await apiClient.post<ApiResponseDto<GpsLogResponseDto>>(
            `${API_ENDPOINTS.TRIP.BASE}/gps`,
            dto
        );
        return response.data;
    },

    addGpsLogs: async (dto: AddGpsLogsDto) => {
        const response = await apiClient.post<ApiResponseDto<GpsLogResponseDto[]>>(
            API_ENDPOINTS.TRIP.CREATE_TRIP_GPS_TRACKING,
            dto
        );
        return response.data;
    },

    getTripById: async (id: string) => {
        const response = await apiClient.get<ApiResponseDto<TripResponseDto>>(
            API_ENDPOINTS.TRIP.GET_TRIP_DETAILS(id)
        );
        return response.data;
    },

    getTripsByDriver: async ( driverId: string ) => {
        const response = await apiClient.get<PaginatedResponseDto<TripResponseDto>>(
            API_ENDPOINTS.TRIP.BASE, { params: {driverId} }
        )
        return response.data;
    },
};