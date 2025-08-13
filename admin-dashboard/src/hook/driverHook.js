import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import driverApi from '../api/driverApi';


export const useGetDrivers = (params) => {
    return useQuery({
        queryKey: ['drivers', params],
        queryFn: () => driverApi.getDrivers(params),
        keepPreviousData: true,
        onError: (error) => {
            console.error('Get drivers error:', error.response?.data || error.message);
        },
    });
};

export const useGetDriverStats = () => {
    return useQuery({
        queryKey: ['driverStats'],
        queryFn: () => driverApi.getDriverStats(),
        onError: (error) => {
            console.error('Get driver stats error:', error.response?.data || error.message);
        },
    });
};

export const useGetDriverById = (id) => {
    return useQuery({
        queryKey: ['driver', id],
        queryFn: () => driverApi.getDriverById(id),
        enabled: !!id,
        onError: (error) => {
            console.error('Get driver by ID error:', error.response?.data || error.message);
        },
    });
};

export const useUpdateDriver = (id) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => driverApi.updateDriver(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['drivers']);
            queryClient.invalidateQueries(['driver', id]);
            queryClient.invalidateQueries(['driverStats']);
        },
        onError: (error) => {
            console.error('Update driver error:', error.response?.data || error.message);
        },
    });
};


export const useUpdateDriverStatus = (id) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => driverApi.updateDriverStatus(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['drivers']);
            queryClient.invalidateQueries(['driver', id]);
            queryClient.invalidateQueries(['driverStats']);
        },
        onError: (error) => {
            console.error('Update driver status error:', error.response?.data || error.message);
        },
    });
};


// Ratings hooks

export const useGetDriverRatings = (params) => {
    return useQuery({
        queryKey: ['driverRatings', params],
        queryFn: () => driverApi.getDriverRatings(params),
        keepPreviousData: true,
        onError: (error) => {
            console.error('Get driver ratings error:', error.response?.data || error.message);
        },
    });
};

export const useGetDriverRatingById = (id) => {
    return useQuery({
        queryKey: ['driverRating', id],
        queryFn: () => driverApi.getDriverRatingById(id),
        enabled: !!id,
        onError: (error) => {
            console.error('Get driver rating by ID error:', error.response?.data || error.message);
        },
    });
};

export const useGetRatingsByDriverId = (driverId) => {
    return useQuery({
        queryKey: ['driverRatingsByDriver', driverId],
        queryFn: () => driverApi.getRatingsByDriverId(driverId),
        enabled: !!driverId,
        onError: (error) => {
            console.error('Get ratings by driver ID error:', error.response?.data || error.message);
        },
    });
};

export const useGetDriverRatingStats = (driverId) => {
    return useQuery({
        queryKey: ['driverRatingStats', driverId],
        queryFn: () => driverApi.getDriverRatingStats(driverId),
        enabled: !!driverId,
        onError: (error) => {
            console.error('Get driver rating stats error:', error.response?.data || error.message);
        },
    });
};
