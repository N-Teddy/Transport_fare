import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authApi from '../api/authApi';

const queryKeys = {
    profile: ['profile'],
};

export const useLogin = () => {
    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            localStorage.setItem('authToken', data.access_token || data.accessToken);
            localStorage.setItem('refreshToken', data.refresh_token || data.refreshToken);
        },
        onError: (error) => {
            console.error('Login error:', error.response?.data || error.message);
        },
    });
};

export const useRegister = () => {
    return useMutation({
        mutationFn: authApi.register,
        onError: (error) => {
            console.error('Register error:', error.response?.data || error.message);
        },
    });
};

export const useRefreshToken = () => {
    return useMutation({
        mutationFn: authApi.refreshToken,
        onSuccess: (data) => {
            localStorage.setItem('authToken', data.access_token || data.accessToken);
        },
        onError: (error) => {
            console.error('Token refresh error:', error.response?.data || error.message);
        },
    });
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: authApi.forgotPassword,
        onError: (error) => {
            console.error('Forgot password error:', error.response?.data || error.message);
        },
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: authApi.resetPassword,
        onError: (error) => {
            console.error('Reset password error:', error.response?.data || error.message);
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: authApi.changePassword,
        onError: (error) => {
            console.error('Change password error:', error.response?.data || error.message);
        },
    });
};

export const useProfile = () => {
    return useQuery({
        queryKey: queryKeys.profile,
        queryFn: authApi.getProfile,
        onError: (error) => {
            console.error('Get profile error:', error.response?.data || error.message);
        },
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: authApi.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries(queryKeys.profile);
        },
        onError: (error) => {
            console.error('Update profile error:', error.response?.data || error.message);
        },
    });
};
