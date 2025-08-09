import { apiClient } from '../provider/axiosClient';
import type {
    DriverLoginDto,
    VerifyOtpDto,
    AuthResponseDto,
    MessageResponseDto,
    ApiResponseDto,
    RefreshTokenDto,
    TokenResponseDto,
} from '../types/auth';
import { API_ENDPOINTS } from './apiEndpoints';

export const AuthService = {

     requestOtp: async (
        payload: DriverLoginDto,
    ): Promise<ApiResponseDto<MessageResponseDto>> => {
        const response = await apiClient.post('/auth/driver/login', payload);
        return response.data;
    },

     verifyOtp: async (
        payload: VerifyOtpDto,
    ): Promise<ApiResponseDto<AuthResponseDto>> => {
        const response = await apiClient.post('/auth/driver/verify-otp', payload);
        return response.data;
     },

    refreshToken: async (
        payload: RefreshTokenDto
    ): Promise<ApiResponseDto<TokenResponseDto>> => {
        const response = await apiClient.post(API_ENDPOINTS.DRIVERS.AUTH.REFRESH, payload);
        return response.data;
    },

}
