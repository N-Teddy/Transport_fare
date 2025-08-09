import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsNumber,
    IsDateString,
    IsBoolean,
    Min,
    Max,
    IsInt,
    MaxLength,
    IsUUID,
    IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateFareRateDto {
    @ApiProperty({
        description: 'Vehicle type ID',
    })
    @IsNotEmpty()
    @IsUUID()
    vehicleTypeId: string;

    @ApiProperty({
        description: 'Base fare in CFA Francs',
        example: 500,
    })
    @IsInt()
    @Min(0)
    baseFare: number;

    @ApiProperty({
        description: 'Rate per kilometer in CFA Francs',
        example: 150,
    })
    @IsInt()
    @Min(0)
    perKmRate: number;

    @ApiPropertyOptional({
        description: 'Night time multiplier (default: 1.0)',
        example: 1.2,
        minimum: 0.5,
        maximum: 3.0,
    })
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0.5)
    @Max(3.0)
    nightMultiplier?: number = 1.0;

    @ApiPropertyOptional({
        description: 'Effective from date',
        example: '2024-01-15T00:00:00Z',
    })
    @IsOptional()
    @IsDateString()
    effectiveFrom?: string;

    @ApiPropertyOptional({
        description: 'Effective until date (null for indefinite)',
        example: '2024-12-31T23:59:59Z',
    })
    @IsOptional()
    @IsDateString()
    effectiveUntil?: string;

    @ApiPropertyOptional({
        description: 'Whether this rate is active',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;

    @ApiPropertyOptional({
        description: 'Additional notes about the rate',
        example: 'Standard taxi fare rate for urban areas',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}

export class UpdateFareRateDto {
    @ApiPropertyOptional({
        description: 'Vehicle type ID',
    })
    @IsOptional()
    @IsUUID()
    vehicleTypeId?: string;

    @ApiPropertyOptional({
        description: 'Base fare in CFA Francs',
        example: 500,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    baseFare?: number;

    @ApiPropertyOptional({
        description: 'Rate per kilometer in CFA Francs',
        example: 150,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    perKmRate?: number;

    @ApiPropertyOptional({
        description: 'Night time multiplier',
        example: 1.2,
        minimum: 0.5,
        maximum: 3.0,
    })
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0.5)
    @Max(3.0)
    nightMultiplier?: number;

    @ApiPropertyOptional({
        description: 'Effective from date',
        example: '2024-01-15T00:00:00Z',
    })
    @IsOptional()
    @IsDateString()
    effectiveFrom?: string;

    @ApiPropertyOptional({
        description: 'Effective until date',
        example: '2024-12-31T23:59:59Z',
    })
    @IsOptional()
    @IsDateString()
    effectiveUntil?: string;

    @ApiPropertyOptional({
        description: 'Whether this rate is active',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Additional notes about the rate',
        example: 'Updated fare rate for peak hours',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}

export class CreateRegionalFareMultiplierDto {
    @ApiProperty({
        description: 'Region ID',
    })
    @IsNotEmpty()
    @IsUUID()
    regionId: string;

    @ApiProperty({
        description: 'Regional price multiplier',
        example: 1.15,
        minimum: 0.5,
        maximum: 3.0,
    })
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0.5)
    @Max(3.0)
    multiplier: number;

    @ApiPropertyOptional({
        description: 'Reason for the multiplier',
        example: 'Higher fuel costs in remote area',
        enum: ['Higher fuel costs', 'Remote area', 'Economic factors', 'Infrastructure costs'],
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    reason?: string;

    @ApiPropertyOptional({
        description: 'Effective from date',
        example: '2024-01-15T00:00:00Z',
    })
    @IsOptional()
    @IsDateString()
    effectiveFrom?: string;

    @ApiPropertyOptional({
        description: 'Effective until date (null for indefinite)',
        example: '2024-12-31T23:59:59Z',
    })
    @IsOptional()
    @IsDateString()
    effectiveUntil?: string;

    @ApiPropertyOptional({
        description: 'Whether this multiplier is active',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean = true;
}

export class UpdateRegionalFareMultiplierDto {
    @ApiPropertyOptional({
        description: 'Region ID',
    })
    @IsOptional()
    @IsUUID()
    regionId?: string;

    @ApiPropertyOptional({
        description: 'Regional price multiplier',
        example: 1.15,
        minimum: 0.5,
        maximum: 3.0,
    })
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0.5)
    @Max(3.0)
    multiplier?: number;

    @ApiPropertyOptional({
        description: 'Reason for the multiplier',
        example: 'Higher fuel costs in remote area',
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    reason?: string;

    @ApiPropertyOptional({
        description: 'Effective from date',
        example: '2024-01-15T00:00:00Z',
    })
    @IsOptional()
    @IsDateString()
    effectiveFrom?: string;

    @ApiPropertyOptional({
        description: 'Effective until date',
        example: '2024-12-31T23:59:59Z',
    })
    @IsOptional()
    @IsDateString()
    effectiveUntil?: string;

    @ApiPropertyOptional({
        description: 'Whether this multiplier is active',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class FareCalculationDto {
    @ApiProperty({
        description: 'Vehicle type ID',
    })
    @IsNotEmpty()
    @IsUUID()
    vehicleTypeId: string;

    @ApiProperty({
        description: 'Distance in kilometers',
        example: 10.5,
    })
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0.1)
    @Max(1000)
    distance: number;

    @ApiPropertyOptional({
        description: 'Region ID for regional multiplier',
    })
    @IsOptional()
    @IsUUID()
    regionId?: string;

    @ApiPropertyOptional({
        description: 'Whether this is a night trip',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    isNightTrip?: boolean = false;

    @ApiPropertyOptional({
        description: 'Additional waiting time in minutes',
        example: 15,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(300)
    waitingTime?: number = 0;

    @ApiPropertyOptional({
        description: 'Custom multiplier (overrides regional multiplier)',
        example: 1.1,
        minimum: 0.5,
        maximum: 3.0,
    })
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0.5)
    @Max(3.0)
    customMultiplier?: number;
}

export class FareRateQueryDto {
    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1,
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        maximum: 100,
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Filter by vehicle type ID',
    })
    @IsOptional()
    @IsUUID()
    vehicleTypeId?: string;

    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true,
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by effective date',
        example: '2024-01-15',
    })
    @IsOptional()
    @IsDateString()
    effectiveDate?: string;

    @ApiPropertyOptional({
        description: 'Sort field',
        enum: ['baseFare', 'perKmRate', 'effectiveFrom', 'createdAt'],
        example: 'createdAt',
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: ['ASC', 'DESC'],
        example: 'DESC',
    })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class RegionalMultiplierQueryDto {
    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1,
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        maximum: 100,
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Filter by region ID',
    })
    @IsOptional()
    @IsUUID()
    regionId?: string;

    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true,
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by effective date',
        example: '2024-01-15',
    })
    @IsOptional()
    @IsDateString()
    effectiveDate?: string;

    @ApiPropertyOptional({
        description: 'Sort field',
        enum: ['multiplier', 'effectiveFrom', 'createdAt'],
        example: 'createdAt',
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({
        description: 'Sort order',
        enum: ['ASC', 'DESC'],
        example: 'DESC',
    })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
