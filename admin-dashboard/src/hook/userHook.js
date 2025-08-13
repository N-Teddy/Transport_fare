import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import usersApi from '../api/userApi';

const queryKeys = {
    all: ['users'],
    lists: () => [...queryKeys.all, 'list'],
    list: (filters) => [...queryKeys.lists(), { filters }],
    details: () => [...queryKeys.all, 'detail'],
    detail: (id) => [...queryKeys.details(), id],
    stats: () => [...queryKeys.all, 'stats'],
};

// GET all users (with filters/pagination)
export const useGetUsers = (filters) => {
    return useQuery({
        queryKey: queryKeys.list(filters),
        queryFn: () => usersApi.getUsers(filters),
    });
};

// GET single user
export const useGetUser = (id) => {
    return useQuery({
        queryKey: queryKeys.detail(id),
        queryFn: () => usersApi.getUser(id),
        enabled: !!id,
    });
};

// CREATE user
export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: usersApi.createUser,
        onSuccess: () => {
            queryClient.invalidateQueries(queryKeys.lists());
            queryClient.invalidateQueries(queryKeys.stats());
        },
    });
};

// UPDATE user
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => usersApi.updateUser(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries(queryKeys.detail(id));
            queryClient.invalidateQueries(queryKeys.lists());
            queryClient.invalidateQueries(queryKeys.stats());
        },
    });
};

// CHANGE password
export const useChangeUserPassword = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => usersApi.changeUserPassword(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries(queryKeys.detail(id));
        },
    });
};

// TOGGLE active
export const useToggleUserActive = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => usersApi.toggleUserActive(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries(queryKeys.detail(id));
            queryClient.invalidateQueries(queryKeys.lists());
            queryClient.invalidateQueries(queryKeys.stats());
        },
    });
};

// DELETE user
export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => usersApi.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries(queryKeys.lists());
            queryClient.invalidateQueries(queryKeys.stats());
        },
    });
};

// GET stats
export const useGetUserStats = () => {
    return useQuery({
        queryKey: queryKeys.stats(),
        queryFn: usersApi.getUserStats,
    });
};
