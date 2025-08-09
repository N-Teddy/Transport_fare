// src/hooks/api/fareHooks.ts

import { useQuery } from "@tanstack/react-query";
import { FareService } from "../api/fareService";
import type { FareRateQueryDto, RegionalMultiplierQueryDto } from "../types/fare";


export const useFareRates = (query: FareRateQueryDto) => {
    return useQuery({
        queryKey: ['fareRates', query],
        queryFn: () => FareService.findAllFareRates(query),
    });
};

export const useActiveFareRateByVehicleType = (vehicleTypeId: string, enabled = true) => {
    return useQuery({
        queryKey: ['fareRate', vehicleTypeId],
        queryFn: () => FareService.findActiveFareRateByVehicleType(vehicleTypeId),
        enabled,
    });
};

export const useActiveRegionalMultiplier = (regionId: string, enabled = true) => {
    return useQuery({
        queryKey: ['regionalMultiplier', regionId],
        queryFn: () => FareService.findActiveRegionalMultiplierByRegion(regionId),
        enabled,
    });
};

export const useRegionalMultipliers = (query: RegionalMultiplierQueryDto) => {
    return useQuery({
        queryKey: ['regionalMultipliers', query],
        queryFn: () => FareService.findAllRegionalMultipliers(query),
    });
};