import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MeterStatusEnum } from 'src/common/enum/status.enum';

export class MeterResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the meter',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Unique meter serial number',
        example: 'MTR-2024-001234',
    })
    meterSerial: string;

    @ApiPropertyOptional({
        description: 'ID of the vehicle this meter is assigned to',
        example: 1,
    })
    vehicleId?: string;

    @ApiPropertyOptional({
        description: 'Meter manufacturer name',
        example: 'TaxiMeter Pro',
    })
    manufacturer: string;

    @ApiPropertyOptional({
        description: 'Meter model name',
        example: 'TM-2000',
    })
    model: string;

    @ApiPropertyOptional({
        description: 'Firmware version installed on the meter',
        example: 'v2.1.0',
    })
    firmwareVersion?: string;

    @ApiPropertyOptional({
        description: 'Date when the meter was installed',
        example: '2024-01-15',
    })
    installationDate?: Date;

    @ApiPropertyOptional({
        description: 'Date of last calibration',
        example: '2024-01-15',
    })
    lastCalibration?: Date;

    @ApiPropertyOptional({
        description: 'Date when next calibration is due',
        example: '2024-07-15',
    })
    nextCalibrationDue?: Date;

    @ApiProperty({
        description: 'Current status of the meter',
        enum: Object.values(MeterStatusEnum),
        example: MeterStatusEnum.ACTIVE,
    })
    status: string;

    @ApiPropertyOptional({
        description: 'Encryption key for secure data transmission',
        example: 'encryption-key-123',
    })
    encryptionKey?: string;

    @ApiProperty({
        description: 'Date when the meter was created',
        example: '2024-01-15T10:30:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the meter was last updated',
        example: '2024-01-15T10:30:00Z',
    })
    updatedAt: Date;
}

export class MeterWithVehicleResponseDto extends MeterResponseDto {
    @ApiPropertyOptional({
        description: 'Vehicle information if assigned',
        type: 'object',
        properties: {
            id: { type: 'number', example: 1 },
            plateNumber: { type: 'string', example: 'ABC-123' },
            make: { type: 'string', example: 'Toyota' },
            model: { type: 'string', example: 'Camry' },
            year: { type: 'number', example: 2020 },
        },
    })
    vehicle?: {
        id: number;
        plateNumber: string;
        make: string;
        model: string;
        year: number;
    };
}

export class MeterListResponseDto {
    @ApiProperty({
        description: 'Array of meters',
        type: [MeterResponseDto],
    })
    data: MeterResponseDto[];

    @ApiProperty({
        description: 'Total number of meters',
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

export class MeterStatisticsResponseDto {
    @ApiProperty({
        description: 'Total number of meters',
        example: 150,
    })
    totalMeters: number;

    @ApiProperty({
        description: 'Number of active meters',
        example: 120,
    })
    activeMeters: number;

    @ApiProperty({
        description: 'Number of meters in maintenance',
        example: 20,
    })
    maintenanceMeters: number;

    @ApiProperty({
        description: 'Number of faulty meters',
        example: 10,
    })
    faultyMeters: number;

    @ApiProperty({
        description: 'Number of meters due for calibration within 30 days',
        example: 15,
    })
    calibrationDueSoon: number;

    @ApiProperty({
        description: 'Number of unassigned meters',
        example: 25,
    })
    unassignedMeters: number;

    @ApiProperty({
        description: 'Meters by manufacturer',
        type: 'string',
        example: {
            'TaxiMeter Pro': 80,
            MeterTech: 45,
            SmartMeter: 25,
        },
    })
    metersByManufacturer: Record<string, number>;
}

export class CalibrationResponseDto {
    @ApiProperty({
        description: 'Meter ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    meterId: string;

    @ApiProperty({
        description: 'Date of calibration',
        example: '2024-01-15',
    })
    calibrationDate: Date;

    @ApiProperty({
        description: 'Next calibration due date',
        example: '2025-01-15',
    })
    nextCalibrationDue: Date;

    @ApiPropertyOptional({
        description: 'Notes about the calibration',
        example: 'Annual calibration completed successfully',
    })
    notes?: string;

    @ApiProperty({
        description: 'Date when calibration was recorded',
        example: '2024-01-15T10:30:00Z',
    })
    createdAt: Date;
}

export class MeterAssignmentResponseDto {
    @ApiProperty({
        description: 'Success message',
        example: 'Meter successfully assigned to vehicle',
    })
    message: string;

    @ApiProperty({
        description: 'Meter ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    meterId: string;

    @ApiProperty({
        description: 'Vehicle ID',
        example: 1,
    })
    vehicleId: string;

    @ApiProperty({
        description: 'Assignment date',
        example: '2024-01-15T10:30:00Z',
    })
    assignedAt: Date;
}

export class MeterStatusUpdateResponseDto {
    @ApiProperty({
        description: 'Meter ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    meterId: string;

    @ApiProperty({
        description: 'Previous status',
        enum: Object.values(MeterStatusEnum),
        example: MeterStatusEnum.ACTIVE,
    })
    previousStatus: string;

    @ApiProperty({
        description: 'New status',
        enum: Object.values(MeterStatusEnum),
        example: MeterStatusEnum.MAINTENANCE,
    })
    newStatus: string;

    @ApiPropertyOptional({
        description: 'Reason for status change',
        example: 'Scheduled maintenance',
    })
    reason?: string;

    @ApiProperty({
        description: 'Status update date',
        example: '2024-01-15T10:30:00Z',
    })
    updatedAt: Date;

    @ApiProperty({
        description: 'Success message',
        example: 'Meter status updated successfully',
    })
    message: string;
}

export class MeterSearchResponseDto {
    @ApiProperty({
        description: 'Array of meters matching search criteria',
        type: [MeterResponseDto],
    })
    meters: MeterResponseDto[];

    @ApiProperty({
        description: 'Total number of matching meters',
        example: 25,
    })
    total: number;

    @ApiProperty({
        description: 'Search term used',
        example: 'MTR-2024',
    })
    searchTerm: string;
}
