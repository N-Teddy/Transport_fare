import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleTypeEnum } from 'src/common/enum/global.enum';

export class FareRateResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the fare rate',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Vehicle type ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    vehicleTypeId: string;

    @ApiProperty({
        description: 'Base fare in CFA Francs',
        example: 500,
    })
    baseFare: number;

    @ApiProperty({
        description: 'Rate per kilometer in CFA Francs',
        example: 150,
    })
    perKmRate: number;

    @ApiProperty({
        description: 'Night time multiplier',
        example: 1.2,
    })
    nightMultiplier: number;

    @ApiProperty({
        description: 'Effective from date',
        example: '2024-01-15T00:00:00Z',
    })
    effectiveFrom: Date;

    @ApiPropertyOptional({
        description: 'Effective until date',
        example: '2024-12-31T23:59:59Z',
    })
    effectiveUntil?: Date;

    @ApiProperty({
        description: 'Whether this rate is active',
        example: true,
    })
    isActive: boolean;

    @ApiPropertyOptional({
        description: 'Additional notes about the rate',
        example: 'Standard taxi fare rate for urban areas',
    })
    notes?: string;

    @ApiProperty({
        description: 'Date when the fare rate was created',
        example: '2024-01-15T10:30:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the fare rate was last updated',
        example: '2024-01-15T10:30:00Z',
    })
    updatedAt: Date;
}

export class FareRateWithVehicleTypeResponseDto extends FareRateResponseDto {
    @ApiPropertyOptional({
        description: 'Vehicle type information',
        type: 'object',
        properties: {
            id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            typeName: { type: 'string', example: 'taxi' },
            description: { type: 'string', example: 'Standard taxi vehicle' },
            maxPassengers: { type: 'number', example: 4 },
        },
    })
    vehicleType?: {
        id: string;
        typeName: string;
        description: string;
        maxPassengers: number;
    };
}

export class RegionalFareMultiplierResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the regional multiplier',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Region ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    regionId: string;

    @ApiProperty({
        description: 'Regional price multiplier',
        example: 1.15,
    })
    multiplier: number;

    @ApiPropertyOptional({
        description: 'Reason for the multiplier',
        example: 'Higher fuel costs in remote area',
    })
    reason?: string;

    @ApiProperty({
        description: 'Effective from date',
        example: '2024-01-15T00:00:00Z',
    })
    effectiveFrom: Date;

    @ApiPropertyOptional({
        description: 'Effective until date',
        example: '2024-12-31T23:59:59Z',
    })
    effectiveUntil?: Date;

    @ApiProperty({
        description: 'Whether this multiplier is active',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Date when the multiplier was created',
        example: '2024-01-15T10:30:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the multiplier was last updated',
        example: '2024-01-15T10:30:00Z',
    })
    updatedAt: Date;
}

export class RegionalFareMultiplierWithRegionResponseDto extends RegionalFareMultiplierResponseDto {
    @ApiPropertyOptional({
        description: 'Region information',
        type: 'object',
        properties: {
            id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
            name: { type: 'string', example: 'Central Region' },
            code: { type: 'string', example: 'CR' },
        },
    })
    region?: {
        id: string;
        name: string;
        code: string;
    };
}

export class FareCalculationResponseDto {
    @ApiProperty({
        description: 'Vehicle type ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    vehicleTypeId: string;

    @ApiProperty({
        description: 'Distance in kilometers',
        example: 10.5,
    })
    distance: number;

    @ApiPropertyOptional({
        description: 'Region ID',
        example: 1,
    })
    regionId?: string;

    @ApiProperty({
        description: 'Whether this is a night trip',
        example: false,
    })
    isNightTrip: boolean;

    @ApiProperty({
        description: 'Additional waiting time in minutes',
        example: 15,
    })
    waitingTime: number;

    @ApiProperty({
        description: 'Base fare in CFA Francs',
        example: 500,
    })
    baseFare: number;

    @ApiProperty({
        description: 'Distance fare in CFA Francs',
        example: 1575,
    })
    distanceFare: number;

    @ApiProperty({
        description: 'Waiting time fare in CFA Francs',
        example: 75,
    })
    waitingFare: number;

    @ApiProperty({
        description: 'Subtotal before multipliers',
        example: 2150,
    })
    subtotal: number;

    @ApiProperty({
        description: 'Night multiplier applied',
        example: 1.0,
    })
    nightMultiplier: number;

    @ApiPropertyOptional({
        description: 'Regional multiplier applied',
        example: 1.15,
    })
    regionalMultiplier?: number;

    @ApiPropertyOptional({
        description: 'Custom multiplier applied',
        example: 1.1,
    })
    customMultiplier?: number;

    @ApiProperty({
        description: 'Final total fare in CFA Francs',
        example: 2472,
    })
    totalFare: number;

    @ApiProperty({
        description: 'Breakdown of fare calculation',
        type: 'object',
        properties: {
            baseFare: { type: 'number', example: 500 },
            distanceFare: { type: 'number', example: 1575 },
            waitingFare: { type: 'number', example: 75 },
            multipliers: {
                type: 'array',
                items: { type: 'string' },
                example: ['night: 1.0', 'regional: 1.15'],
            },
        },
    })
    breakdown: {
        baseFare: number;
        distanceFare: number;
        waitingFare: number;
        multipliers: string[];
    };

    @ApiProperty({
        description: 'Calculation timestamp',
        example: '2024-01-15T10:30:00Z',
    })
    calculatedAt: Date;
}

export class FareRateListResponseDto {
    @ApiProperty({
        description: 'Array of fare rates',
        type: [FareRateResponseDto],
    })
    data: FareRateResponseDto[];

    @ApiProperty({
        description: 'Total number of fare rates',
        example: 100,
    })
    total: number;

    @ApiProperty({
        description: 'Current page number',
        example: 1,
    })
    page: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
    })
    limit: number;

    @ApiProperty({
        description: 'Total number of pages',
        example: 10,
    })
    totalPages: number;

    @ApiProperty({
        description: 'Whether there is a next page',
        example: true,
    })
    hasNextPage: boolean;

    @ApiProperty({
        description: 'Whether there is a previous page',
        example: false,
    })
    hasPrevPage: boolean;
}

export class RegionalMultiplierListResponseDto {
    @ApiProperty({
        description: 'Array of regional multipliers',
        type: [RegionalFareMultiplierResponseDto],
    })
    data: RegionalFareMultiplierResponseDto[];

    @ApiProperty({
        description: 'Total number of regional multipliers',
        example: 50,
    })
    total: number;

    @ApiProperty({
        description: 'Current page number',
        example: 1,
    })
    page: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
    })
    limit: number;

    @ApiProperty({
        description: 'Total number of pages',
        example: 5,
    })
    totalPages: number;

    @ApiProperty({
        description: 'Whether there is a next page',
        example: true,
    })
    hasNextPage: boolean;

    @ApiProperty({
        description: 'Whether there is a previous page',
        example: false,
    })
    hasPrevPage: boolean;
}

export class FareStatisticsResponseDto {
    @ApiProperty({
        description: 'Total number of fare rates',
        example: 150,
    })
    totalFareRates: number;

    @ApiProperty({
        description: 'Number of active fare rates',
        example: 120,
    })
    activeFareRates: number;

    @ApiProperty({
        description: 'Number of inactive fare rates',
        example: 30,
    })
    inactiveFareRates: number;

    @ApiProperty({
        description: 'Total number of regional multipliers',
        example: 50,
    })
    totalRegionalMultipliers: number;

    @ApiProperty({
        description: 'Number of active regional multipliers',
        example: 45,
    })
    activeRegionalMultipliers: number;

    @ApiProperty({
        description: 'Average base fare across all vehicle types',
        example: 450,
    })
    averageBaseFare: number;

    @ApiProperty({
        description: 'Average per kilometer rate across all vehicle types',
        example: 125,
    })
    averagePerKmRate: number;

    @ApiProperty({
        description: 'Average regional multiplier',
        example: 1.08,
    })
    averageRegionalMultiplier: number;

    @ApiProperty({
        description: 'Fare rates by vehicle type',
        type: 'string',
        example: {
            taxi: 25,
            bus: 15,
            motorcycle: 30,
            shared_taxi: 20,
        },
    })
    fareRatesByVehicleType: Record<string, number>;

    @ApiProperty({
        description: 'Regional multipliers by region',
        type: 'string',
        example: {
            'Central Region': 1.0,
            'Northern Region': 1.15,
            'Southern Region': 1.1,
        },
    })
    multipliersByRegion: Record<string, number>;

    @ApiProperty({
        description: 'Fare rates expiring soon (within 30 days)',
        example: 5,
    })
    expiringSoon: number;
}

export class VehicleTypeFareResponseDto {
    @ApiProperty({
        description: 'Vehicle type ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Vehicle type name',
        enum: Object.values(VehicleTypeEnum),
        example: 'taxi',
    })
    typeName: string;

    @ApiProperty({
        description: 'Vehicle type description',
        example: 'Standard taxi vehicle',
    })
    description: string;

    @ApiProperty({
        description: 'Maximum number of passengers',
        example: 4,
    })
    maxPassengers: number;

    @ApiProperty({
        description: 'Current active fare rate',
        type: FareRateResponseDto,
    })
    currentFareRate: FareRateResponseDto;

    @ApiProperty({
        description: 'Historical fare rates',
        type: [FareRateResponseDto],
    })
    historicalFareRates: FareRateResponseDto[];
}

export class FareComparisonResponseDto {
    @ApiProperty({
        description: 'Vehicle type ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    vehicleTypeId: string;

    @ApiProperty({
        description: 'Distance in kilometers',
        example: 10.5,
    })
    distance: number;

    @ApiProperty({
        description: 'Fare calculations for different scenarios',
        type: 'object',
        properties: {
            day_urban: { type: 'number', example: 2150 },
            night_urban: { type: 'number', example: 2580 },
            day_rural: { type: 'number', example: 2472 },
            night_rural: { type: 'number', example: 2966 },
        },
    })
    scenarios: {
        day_urban: number;
        night_urban: number;
        day_rural: number;
        night_rural: number;
    };

    @ApiProperty({
        description: 'Comparison timestamp',
        example: '2024-01-15T10:30:00Z',
    })
    comparedAt: Date;
}
