import { ApiProperty } from '@nestjs/swagger';

export class TripResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    driverId: string;

    @ApiProperty()
    vehicleId: string;

    @ApiProperty({ required: false })
    meterId?: string;

    @ApiProperty()
    startTime: Date;

    @ApiProperty({ required: false })
    endTime?: Date;

    @ApiProperty({ required: false })
    startLatitude?: number;

    @ApiProperty({ required: false })
    startLongitude?: number;

    @ApiProperty({ required: false })
    endLatitude?: number;

    @ApiProperty({ required: false })
    endLongitude?: number;

    @ApiProperty({ required: false })
    distanceKm?: number;

    @ApiProperty({ required: false })
    durationMinutes?: number;

    @ApiProperty({ required: false })
    baseFare?: number;

    @ApiProperty({ required: false })
    distanceFare?: number;

    @ApiProperty({ required: false })
    timeFare?: number;

    @ApiProperty({ required: false })
    surcharges?: number;

    @ApiProperty()
    totalFare: number;

    @ApiProperty()
    paymentMethod: string;

    @ApiProperty()
    paymentStatus: string;

    @ApiProperty({ required: false })
    paymentReference?: string;

    @ApiProperty({ required: false })
    passengerPhone?: string;

    @ApiProperty()
    dataSource: string;

    @ApiProperty()
    syncStatus: string;

    @ApiProperty({ required: false })
    syncedAt?: Date;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}

export class GpsLogResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    tripId: string;

    @ApiProperty()
    latitude: number;

    @ApiProperty()
    longitude: number;

    @ApiProperty({ required: false })
    speed?: number;

    @ApiProperty({ required: false })
    heading?: number;

    @ApiProperty({ required: false })
    accuracy?: number;

    @ApiProperty()
    timestamp: Date;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
