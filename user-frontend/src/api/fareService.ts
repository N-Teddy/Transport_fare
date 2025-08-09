// src/api/fareService.ts

import { apiClient } from "../provider/axiosClient";
import type { FareRateQueryDto, FareRateResponseDto, PaginatedResponseDto, RegionalFareMultiplierResponseDto, RegionalMultiplierListResponseDto, RegionalMultiplierQueryDto } from "../types/fare";
import { API_ENDPOINTS } from "./apiEndpoints";


export const FareService = {
    findAllFareRates: async (query: FareRateQueryDto) => {
        const response = await apiClient.get<PaginatedResponseDto<FareRateResponseDto>>(
            API_ENDPOINTS.RATES.FARE.GET_ALL_RATES,
            { params: query }
        );
        return response.data;
    },

    findActiveFareRateByVehicleType: async (vehicleTypeId: string) => {
        const response = await apiClient.get<FareRateResponseDto>(
            API_ENDPOINTS.RATES.FARE.GET_BY_VEHICLE_TYPE(vehicleTypeId)
        );
        return response.data;
    },

    findActiveRegionalMultiplierByRegion: async (regionId: string) => {
        const response = await apiClient.get<RegionalFareMultiplierResponseDto>(
            API_ENDPOINTS.RATES.REGION.GET_BY_ID(regionId)
        );
        return response.data;
    },

    findAllRegionalMultipliers: async (query: RegionalMultiplierQueryDto) => {
        const response = await apiClient.get<RegionalMultiplierListResponseDto>(
            API_ENDPOINTS.RATES.REGION.GET_RATES,
            { params: query }
        );
        return response.data;
    },
};