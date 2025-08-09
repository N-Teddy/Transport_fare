// src/hooks/geographyHooks.ts

import { useQuery } from "@tanstack/react-query";
import { GeographyService } from "../api/geographyService";
import type {
    CityQueryDto,
    RegionQueryDto
} from "../types/geography";

export const useFindAllRegions = (query: RegionQueryDto) => {
    return useQuery({
        queryKey: ['regions', query],
        queryFn: () => GeographyService.findAllRegions(query),
    });
};

export const useFindRegionById = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['region', id],
        queryFn: () => GeographyService.findRegionById(id),
        enabled: enabled && !!id,
    });
};

export const useFindRegionWithCities = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['region-with-cities', id],
        queryFn: () => GeographyService.findRegionWithCities(id),
        enabled: enabled && !!id,
    });
};

export const useFindAllCities = (query: CityQueryDto) => {
    return useQuery({
        queryKey: ['cities', query],
        queryFn: () => GeographyService.findAllCities(query),
    });
};

export const useFindMajorCities = () => {
    return useQuery({
        queryKey: ['cities-major'],
        queryFn: () => GeographyService.findMajorCities(),
    });
};

export const useFindCityById = (id: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['city', id],
        queryFn: () => GeographyService.findCityById(id),
        enabled: enabled && !!id,
    });
};

export const useFindCitiesByRegion = (regionId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['cities-by-region', regionId],
        queryFn: () => GeographyService.findCitiesByRegion(regionId),
        enabled: enabled && !!regionId,
    });
};