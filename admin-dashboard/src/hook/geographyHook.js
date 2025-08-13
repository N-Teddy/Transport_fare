// src/hooks/useGeography.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { geographyApi } from '../api/geographyApi';

// ====== REGIONS ======
export const useRegions = (params) =>
    useQuery({
        queryKey: ['regions', params],
        queryFn: () => geographyApi.getRegions(params).then((res) => res.data),
    });

export const useRegion = (id) =>
    useQuery({
        queryKey: ['region', id],
        queryFn: () => geographyApi.getRegionById(id).then((res) => res.data),
        enabled: !!id,
    });

export const useCreateRegion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => geographyApi.createRegion(data).then((res) => res.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regions'] }),
    });
};

export const useUpdateRegion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) =>
            geographyApi.updateRegion(id, data).then((res) => res.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regions'] }),
    });
};

export const useDeleteRegion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => geographyApi.deleteRegion(id).then((res) => res.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regions'] }),
    });
};

// ====== CITIES ======
export const useCities = (params) =>
    useQuery({
        queryKey: ['cities', params],
        queryFn: () => geographyApi.getCities(params).then((res) => res.data),
    });

export const useCity = (id) =>
    useQuery({
        queryKey: ['city', id],
        queryFn: () => geographyApi.getCityById(id).then((res) => res.data),
        enabled: !!id,
    });

export const useCreateCity = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => geographyApi.createCity(data).then((res) => res.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cities'] }),
    });
};

export const useUpdateCity = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) =>
            geographyApi.updateCity(id, data).then((res) => res.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cities'] }),
    });
};

export const useDeleteCity = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => geographyApi.deleteCity(id).then((res) => res.data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cities'] }),
    });
};

// ====== STATS ======
export const useGeographyStats = () =>
    useQuery({
        queryKey: ['geography-stats'],
        queryFn: () => geographyApi.getGeographyStats().then((res) => res.data),
    });
