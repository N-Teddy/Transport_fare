// src/hooks/api/vehicleHooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { VehicleService } from '../api/vehicleService';
import type { CreateVehicleDto, VehicleTypeQueryDto } from '../types/vehicle';


export const useCreateVehicle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (vehicleData: CreateVehicleDto) => VehicleService.createVehicle(vehicleData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        },
    });
};

export const useGetVehicle = (ownerDriverId: string, enabled = true) => {
    return useQuery({
        queryKey: ['vehicle', ownerDriverId],
        queryFn: () => VehicleService.getVehicle(ownerDriverId),
        enabled,
    });
};

export const useGetVehicleType = (id: string, enabled = true) => {
    return useQuery({
        queryKey: ['vehicleType', id],
        queryFn: () => VehicleService.getVehicleTypeById(id),
        enabled,
    });
};

export const useGetAllVehicleTypes = (query: VehicleTypeQueryDto) => {
    return useQuery({
        queryKey: ['vehicleTypes', query],
        queryFn: () => VehicleService.getAllVehicleTypes(query),
    });
};