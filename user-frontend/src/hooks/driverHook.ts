// src/hooks/api/driverHooks.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateDriverDto } from "../types/driver";
import { DriverService } from "../api/driverService";


export const useCreateDriver = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (driverData: CreateDriverDto) => DriverService.createDriver(driverData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        },
    });
};

export const useGetDriver = (id: string, enabled = true) => {
    return useQuery({
        queryKey: ['driver', id],
        queryFn: () => DriverService.getDriverById(id),
        enabled,
    });
};

export const useUpdateDriver = (id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (updateData: Partial<CreateDriverDto>) =>
            DriverService.updateDriver(id, updateData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['driver', id] });
            queryClient.invalidateQueries({ queryKey: ['drivers'] });
        },
    });
};

export const useVerifyDriverPhotos = (id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => DriverService.verifyDriverPhotos(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['driver', id] });
        },
    });
};

export const useGetDriverRating = (id: string, enabled = true) => {
    return useQuery({
        queryKey: ['driverRating', id],
        queryFn: () => DriverService.getDriverRating(id),
        enabled,
    });
};