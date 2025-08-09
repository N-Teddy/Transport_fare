// src/hooks/api/tripHooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TripService } from '../api/tripService';
import type { AddGpsLogDto, AddGpsLogsDto, CreateTripDto, EndTripDto } from '../types/trip';


export const useCreateTrip = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tripData: CreateTripDto) => TripService.createTrip(tripData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trips'] });
        },
    });
};

export const useEndTrip = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tripData: EndTripDto) => TripService.endTrip(tripData),
        onSuccess: ( variables) => {
            queryClient.invalidateQueries({ queryKey: ['trip', variables.data] });
            queryClient.invalidateQueries({ queryKey: ['trips'] });
        },
    });
};

export const useAddGpsLog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (logData: AddGpsLogDto) => TripService.addGpsLog(logData),
        onSuccess: ( variables) => {
            queryClient.invalidateQueries({ queryKey: ['trip', variables.data] });
        },
    });
};

export const useAddGpsLogs = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (logsData: AddGpsLogsDto) => TripService.addGpsLogs(logsData),
        onSuccess: ( variables) => {
            queryClient.invalidateQueries({ queryKey: ['trip', variables.data] });
        },
    });
};

export const useGetTrip = (id: string, enabled = true) => {
    return useQuery({
        queryKey: ['trip', id],
        queryFn: () => TripService.getTripById(id),
        enabled,
    });
};

export const useGetTripsByDriver = (driverId: string, enabled = true) => {
    return useQuery({
        queryKey: ['trips', driverId],
        queryFn: () => TripService.getTripsByDriver(driverId),
        enabled,
    });
};