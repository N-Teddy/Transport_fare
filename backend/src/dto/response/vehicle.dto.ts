import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleTypeEnum } from 'src/common/enum/global.enum';

// Vehicle Type Response DTOs
export class VehicleTypeResponseDto {
    @ApiProperty({
        description: 'Vehicle type ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Vehicle type name',
        enum: VehicleTypeEnum,
        example: 'taxi',
    })
    typeName: string;

    @ApiPropertyOptional({
        description: 'Vehicle type description',
        example: 'Standard taxi vehicle for passenger transport',
    })
    description?: string;

    @ApiPropertyOptional({
        description: 'Maximum number of passengers',
        example: 4,
    })
    maxPassengers?: number;

    @ApiProperty({
        description: 'Whether helmet is required',
        example: false,
    })
    requiresHelmet: boolean;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    updatedAt: Date;
}

export class VehicleTypeListResponseDto {
    @ApiProperty({
        description: 'Array of vehicle types',
        type: [VehicleTypeResponseDto],
    })
    data: VehicleTypeResponseDto[];

    @ApiProperty({
        description: 'Total number of vehicle types',
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
}

// Vehicle Response DTOs
export class VehicleResponseDto {
    @ApiProperty({
        description: 'Vehicle ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Vehicle type ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    vehicleTypeId: string;

    @ApiProperty({
        description: 'Vehicle license plate number',
        example: 'ABC123',
    })
    licensePlate: string;

    @ApiPropertyOptional({
        description: 'Vehicle make/brand',
        example: 'Toyota',
    })
    make?: string;

    @ApiPropertyOptional({
        description: 'Vehicle model',
        example: 'Camry',
    })
    model?: string;

    @ApiPropertyOptional({
        description: 'Vehicle manufacturing year',
        example: 2020,
    })
    year?: number;

    @ApiPropertyOptional({
        description: 'Vehicle color',
        example: 'White',
    })
    color?: string;

    @ApiPropertyOptional({
        description: 'Engine capacity in cc (for motorcycles)',
        example: 150,
    })
    engineCapacity?: number;

    @ApiPropertyOptional({
        description: 'Insurance policy number',
        example: 'INS123456789',
    })
    insuranceNumber?: string;

    @ApiPropertyOptional({
        description: 'Insurance expiry date',
        example: '2024-12-31',
    })
    insuranceExpiry?: Date;

    @ApiPropertyOptional({
        description: 'Vehicle inspection expiry date',
        example: '2024-06-30',
    })
    inspectionExpiry?: Date;

    @ApiPropertyOptional({
        description: 'Owner driver ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    ownerDriverId?: string;

    @ApiProperty({
        description: 'Vehicle registration date',
        example: '2024-01-01T00:00:00.000Z',
    })
    registrationDate: Date;

    @ApiProperty({
        description: 'Vehicle status',
        example: 'active',
    })
    status: string;

    @ApiProperty({
        description: 'Whether photos are verified',
        // example: false,
    })
    photosVerified: boolean;

    @ApiPropertyOptional({
        description: 'Last photo update timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    lastPhotoUpdate?: Date;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    updatedAt: Date;

    // Related data
    @ApiPropertyOptional({
        description: 'Vehicle type information',
        type: VehicleTypeResponseDto,
    })
    vehicleType?: VehicleTypeResponseDto;

    @ApiPropertyOptional({
        description: 'Owner driver information',
    })
    ownerDriver?: any;
}

export class VehicleDetailResponseDto extends VehicleResponseDto {
    @ApiPropertyOptional({
        description: 'Array of vehicle photos',
        type: [Object],
    })
    photos?: any[];

    @ApiPropertyOptional({
        description: 'Array of vehicle meters',
        type: [Object],
    })
    meters?: any[];

    @ApiPropertyOptional({
        description: 'Array of vehicle trips',
        type: [Object],
    })
    trips?: any[];
}

export class VehicleListResponseDto {
    @ApiProperty({
        description: 'Array of vehicles',
        type: [VehicleResponseDto],
    })
    data: VehicleResponseDto[];

    @ApiProperty({
        description: 'Total number of vehicles',
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
}

// Statistics DTOs
export class VehicleStatisticsDto {
    @ApiProperty({
        description: 'Total number of vehicles',
        example: 1000,
    })
    totalVehicles: number;

    @ApiProperty({
        description: 'Number of active vehicles',
        example: 850,
    })
    activeVehicles: number;

    @ApiProperty({
        description: 'Number of inactive vehicles',
        example: 150,
    })
    inactiveVehicles: number;

    @ApiProperty({
        description: 'Number of vehicles with verified photos',
        example: 750,
    })
    verifiedPhotos: number;

    @ApiProperty({
        description: 'Number of vehicles with expired insurance',
        example: 25,
    })
    expiredInsurance: number;

    @ApiProperty({
        description: 'Number of vehicles with expired inspection',
        example: 15,
    })
    expiredInspection: number;

    @ApiProperty({
        description: 'Vehicles by type',
        example: {
            taxi: 500,
            bus: 200,
            motorcycle: 300,
        },
    })
    byType: Record<string, number>;

    @ApiProperty({
        description: 'Vehicles by status',
        example: {
            active: 850,
            inactive: 100,
            maintenance: 50,
        },
    })
    byStatus: Record<string, number>;
}

export class VehicleTypeStatisticsDto {
    @ApiProperty({
        description: 'Total number of vehicle types',
        example: 6,
    })
    totalTypes: number;

    @ApiProperty({
        description: 'Vehicle types with helmet requirement',
        example: 2,
    })
    requiresHelmet: number;

    @ApiProperty({
        description: 'Vehicle types by passenger capacity',
        example: {
            '1-2': 2,
            '3-5': 3,
            '6+': 1,
        },
    })
    byPassengerCapacity: Record<string, number>;
}

// Bulk operation responses
export class BulkUpdateResponseDto {
    @ApiProperty({
        description: 'Number of vehicles updated',
        example: 50,
    })
    updatedCount: number;

    @ApiProperty({
        description: 'Array of vehicle IDs that were updated',
        example: [
            '123e4567-e89b-12d3-a456-426614174000',
            '123e4567-e89b-12d3-a456-426614174001',
            '123e4567-e89b-12d3-a456-426614174002',
        ],
    })
    updatedIds: string[];

    @ApiProperty({
        description: 'Array of vehicle IDs that failed to update',
        example: [],
    })
    failedIds: string[];
}

export class VehiclePhotoVerificationResponseDto {
    @ApiProperty({
        description: 'Vehicle ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    vehicleId: string;

    @ApiProperty({
        description: 'Whether photos are verified',
        example: true,
    })
    photosVerified: boolean;

    @ApiProperty({
        description: 'Last photo update timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    lastPhotoUpdate: Date;

    @ApiProperty({
        description: 'Update timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    updatedAt: Date;
}

// Simple response DTOs
export class VehicleCreatedResponseDto {
    @ApiProperty({
        description: 'Vehicle ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Vehicle license plate',
        example: 'ABC123',
    })
    licensePlate: string;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;
}

export class VehicleTypeCreatedResponseDto {
    @ApiProperty({
        description: 'Vehicle type ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Vehicle type name',
        example: 'taxi',
    })
    typeName: string;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;
}

export class VehicleTypeUpdatedResponseDto {
    @ApiProperty({
        description: 'Success message',
        example: 'Vehicle type updated successfully',
    })
    message: string;

    @ApiProperty({
        description: 'Updated vehicle type data',
        type: VehicleTypeResponseDto,
    })
    vehicleType: VehicleTypeResponseDto;
}

export class VehicleUpdatedResponseDto {
    @ApiProperty({
        description: 'Success message',
        example: 'Vehicle updated successfully',
    })
    message: string;

    @ApiProperty({
        description: 'Updated vehicle data',
        type: VehicleResponseDto,
    })
    vehicle: VehicleResponseDto;
}
