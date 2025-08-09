import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type {
    DriverLoginDto,
    VerifyOtpDto,
    ApiResponseDto,
    AuthResponseDto,
    MessageResponseDto,
    RefreshTokenDto,
    TokenResponseDto,
} from '../types/auth';
import { AuthService } from '../api/authService';

export const useRequestOtp = (
    options?: UseMutationOptions<
        ApiResponseDto<MessageResponseDto>,
        Error,
        DriverLoginDto
    >
) => {
    return useMutation({
        mutationFn: AuthService.requestOtp,
        ...options, // spread options like onSuccess, onError
    });
};

export const useVerifyOtp = (
    options?: UseMutationOptions<
        ApiResponseDto<AuthResponseDto>,
        Error,
        VerifyOtpDto
    >
) => {
    return useMutation({
        mutationFn: AuthService.verifyOtp,
        ...options,
    });
};

export const useRefreshToken = () => {
    return useMutation<ApiResponseDto<TokenResponseDto>, Error, RefreshTokenDto>({
        mutationFn: (payload) => AuthService.refreshToken(payload),
    });
};