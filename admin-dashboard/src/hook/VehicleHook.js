import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import vehicleApi from '../api/vehicleApi';

export const VEHICLE_KEYS = {
    allVehicles: ['vehicles'],
    vehicle: (id) => ['vehicle', id],
    statistics: ['vehicle-statistics'],

    allVehicleTypes: ['vehicle-types'],
    vehicleType: (id) => ['vehicle-type', id],
    typeStatistics: ['vehicle-type-statistics'],

    bulkStatus: ['vehicle-bulk-status'],
    bulkPhotoVerify: ['vehicle-bulk-photo'],
};

// VEHICLE TYPES
export const useVehicleTypes = (filters) =>
    useQuery({
        queryKey: [...VEHICLE_KEYS.allVehicleTypes, filters],
        queryFn: () => vehicleApi.getAllVehicleTypes(filters),
    });

export const useVehicleType = (id) =>
    useQuery({
        queryKey: VEHICLE_KEYS.vehicleType(id),
        queryFn: () => vehicleApi.getVehicleTypeById(id),
        enabled: !!id,
    });

export const useCreateVehicleType = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: vehicleApi.createVehicleType,
        onSuccess: () => qc.invalidateQueries(VEHICLE_KEYS.allVehicleTypes),
    });
};

export const useUpdateVehicleType = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => vehicleApi.updateVehicleType(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries(VEHICLE_KEYS.allVehicleTypes);
            qc.invalidateQueries(VEHICLE_KEYS.vehicleType(id));
        },
    });
};

export const useDeleteVehicleType = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: vehicleApi.deleteVehicleType,
        onSuccess: () => qc.invalidateQueries(VEHICLE_KEYS.allVehicleTypes),
    });
};

export const useVehicleTypeStatistics = () =>
    useQuery({
        queryKey: VEHICLE_KEYS.typeStatistics,
        queryFn: vehicleApi.getVehicleTypeStatistics,
    });

// VEHICLES
export const useVehicles = (filters) =>
    useQuery({
        queryKey: [...VEHICLE_KEYS.allVehicles, filters],
        queryFn: () => vehicleApi.getAllVehicles(filters),
    });

export const useVehicle = (id) =>
    useQuery({
        queryKey: VEHICLE_KEYS.vehicle(id),
        queryFn: () => vehicleApi.getVehicleById(id),
        enabled: !!id,
    });

export const useCreateVehicle = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: vehicleApi.createVehicle,
        onSuccess: () => qc.invalidateQueries(VEHICLE_KEYS.allVehicles),
    });
};

export const useUpdateVehicle = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => vehicleApi.updateVehicle(id, data),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries(VEHICLE_KEYS.allVehicles);
            qc.invalidateQueries(VEHICLE_KEYS.vehicle(id));
        },
    });
};

export const useDeleteVehicle = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: vehicleApi.deleteVehicle,
        onSuccess: () => qc.invalidateQueries(VEHICLE_KEYS.allVehicles),
    });
};

export const useVehicleStatistics = () =>
    useQuery({
        queryKey: VEHICLE_KEYS.statistics,
        queryFn: vehicleApi.getVehicleStatistics,
    });

// BULK OPS
export const useBulkUpdateVehicleStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: vehicleApi.bulkUpdateVehicleStatus,
        onSuccess: () => qc.invalidateQueries(VEHICLE_KEYS.allVehicles),
    });
};

export const useBulkVerifyVehiclePhotos = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: vehicleApi.bulkVerifyVehiclePhotos,
        onSuccess: () => qc.invalidateQueries(VEHICLE_KEYS.allVehicles),
    });
};
