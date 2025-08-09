// src/types/trip.ts
export type PaymentMethod = 'cash' | 'MOBILE_MONEY' | 'CARD' | 'CREDIT'

export type PaymentStatus =  'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export type TripSyncStatus = 'PENDING' | 'SYNCED' | 'FAILED'


export interface CreateTripDto {
    driverId: string;
    vehicleId: string;
    meterId?: string;
    startTime: string;
    startLatitude?: number;
    startLongitude?: number;
    dataSource?: string;
}

export interface TripResponseDto {
    id: string;
    driverId: string;
    vehicleId: string;
    meterId?: string;
    startTime: Date;
    endTime?: Date;
    startLatitude?: number;
    startLongitude?: number;
    endLatitude?: number;
    endLongitude?: number;
    distanceKm?: number;
    durationMinutes?: number;
    baseFare?: number;
    distanceFare?: number;
    timeFare?: number;
    surcharges?: number;
    totalFare: number;
    paymentMethod: string;
    paymentStatus: string;
    paymentReference?: string;
    passengerPhone?: string;
    dataSource: string;
    syncStatus: string;
    syncedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface EndTripDto {
    tripId: string;
    endTime: string;
    endLatitude?: number;
    endLongitude?: number;
    distanceKm?: number;
    durationMinutes?: number;
    baseFare?: number;
    distanceFare?: number;
    timeFare?: number;
    surcharges?: number;
    totalFare?: number;
    paymentMethod: string;
    paymentReference?: string;
    passengerPhone?: string;
}

export interface AddGpsLogDto {
    tripId: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    timestamp: Date;
}

export interface AddGpsLogsDto {
    tripId: string;
    logs: Omit<AddGpsLogDto, 'tripId'>[];
}

export interface GpsLogResponseDto {
    id: string;
    tripId: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    accuracy?: number;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ApiResponseDto<T> {
    status: 'success' | 'error';
    message: string;
    data: T;
}