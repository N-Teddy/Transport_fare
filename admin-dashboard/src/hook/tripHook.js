import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import tripApi from '../api/tripApi';

// Get all trips with optional filters
export const useTrips = (filters) => {
    return useQuery({
        queryKey: ['trips', filters],
        queryFn: () => tripApi.getTrips(filters),
    });
};

// Get single trip by ID
export const useTrip = (id) => {
    return useQuery({
        queryKey: ['trip', id],
        queryFn: () => tripApi.getTrip(id),
        enabled: !!id,
    });
};

// Create trip
export const useCreateTrip = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tripApi.createTrip,
        onSuccess: () => {
            queryClient.invalidateQueries(['trips']);
        },
    });
};

// End trip
export const useEndTrip = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tripApi.endTrip,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['trips']);
            queryClient.invalidateQueries(['trip', variables?.id]);
        },
    });
};

// Add GPS log
export const useAddGpsLog = () => {
    return useMutation({
        mutationFn: tripApi.addGpsLog,
    });
};

// Add multiple GPS logs
export const useAddGpsLogs = () => {
    return useMutation({
        mutationFn: tripApi.addGpsLogs,
    });
};

// Get GPS logs for a trip
export const useGpsLogs = (tripId) => {
    return useQuery({
        queryKey: ['gpsLogs', tripId],
        queryFn: () => tripApi.getGpsLogs(tripId),
        enabled: !!tripId,
    });
};

// Overall trip stats
export const useTripStats = () => {
    return useQuery({
        queryKey: ['tripStats'],
        queryFn: tripApi.getTripStats,
    });
};

// Stats for a driver
export const useDriverTripStats = (driverId) => {
    return useQuery({
        queryKey: ['driverTripStats', driverId],
        queryFn: () => tripApi.getDriverTripStats(driverId),
        enabled: !!driverId,
    });
};

// Stats for a vehicle
export const useVehicleTripStats = (vehicleId) => {
    return useQuery({
        queryKey: ['vehicleTripStats', vehicleId],
        queryFn: () => tripApi.getVehicleTripStats(vehicleId),
        enabled: !!vehicleId,
    });
};

// Daily trip stats
export const useDailyTripStats = (startDate, endDate) => {
    return useQuery({
        queryKey: ['dailyTripStats', startDate, endDate],
        queryFn: () => tripApi.getDailyTripStats(startDate, endDate),
        enabled: !!startDate && !!endDate,
    });
};
