export interface DriverLoginDto {
    phoneNumber: string;
}

export interface VerifyOtpDto {
    phoneNumber: string;
    otp: string;
}

export interface TokenResponseDto {
    accessToken: string;
    refreshToken: string;
}

export interface UserProfileDto {
    id: string;
    phoneNumber: string;
    name?: string;
    // add more fields if needed
}

export interface AuthResponseDto {
    tokens: TokenResponseDto;
    user: UserProfileDto;
}

export interface MessageResponseDto {
    message: string;
}

export interface ApiResponseDto<T = any> {
    status: 'success' | 'failure';
    message: string;
    data: T;
}


export const ApiResponseStatusEnum = {
    SUCCESS: 'success',
    FAILURE: 'fail',
} as const


export type ApiResponseStatus = keyof typeof ApiResponseStatusEnum;


export interface RefreshTokenDto {
    refresh_token: string;
}

export interface TokenResponseDto {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}

export interface DecodedToken {
    userId: string; // userId
    username: string;
    iat: number;
}