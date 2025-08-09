import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsDateString,
    IsEnum,
    IsUUID,
    MinLength,
    MaxLength,
    IsInt,
    Min,
    Max,
    IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { MeterStatusEnum } from 'src/common/enum/status.enum';

export class CreateMeterDto {
    @ApiProperty({
        description: 'Unique meter serial number',
        example: 'MTR-2024-001234',
    })
    @IsString()
    @MinLength(5)
    @MaxLength(100)
    meterSerial: string;

    @ApiProperty({ description: 'Vehicle ID to assign meter to', required: false })
    @IsOptional()
    @IsUUID()
    vehicleId?: string;

    @ApiPropertyOptional({
        description: 'Meter manufacturer name',
        example: 'TaxiMeter Pro',
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    manufacturer?: string;

    @ApiPropertyOptional({
        description: 'Meter model name',
        example: 'TM-2000',
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    model?: string;

    @ApiPropertyOptional({
        description: 'Firmware version installed on the meter',
        example: 'v2.1.0',
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    firmwareVersion?: string;

    @ApiPropertyOptional({
        description: 'Date when the meter was installed',
        example: '2024-01-15',
    })
    @IsOptional()
    @IsDateString()
    installationDate?: string;

    @ApiPropertyOptional({
        description: 'Date of last calibration',
        example: '2024-01-15',
    })
    @IsOptional()
    @IsDateString()
    lastCalibration?: string;

    @ApiPropertyOptional({
        description: 'Date when next calibration is due',
        example: '2024-07-15',
    })
    @IsOptional()
    @IsDateString()
    nextCalibrationDue?: string;

    @ApiPropertyOptional({
        description: 'Current status of the meter',
        enum: Object.values(MeterStatusEnum),
        example: MeterStatusEnum.ACTIVE,
    })
    @IsOptional()
    @IsEnum(MeterStatusEnum)
    status?: string;

    @ApiPropertyOptional({
        description: 'Encryption key for secure data transmission',
        example: 'encryption-key-123',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    encryptionKey?: string;
}

export class UpdateMeterDto {
    @ApiPropertyOptional({
        description: 'Unique meter serial number',
        example: 'MTR-2024-001234',
    })
    @IsOptional()
    @IsString()
    @MinLength(5)
    @MaxLength(100)
    meterSerial?: string;

    @ApiProperty({ description: 'Vehicle ID to assign meter to', required: false })
    @IsOptional()
    @IsUUID()
    vehicleId?: string;

    @ApiPropertyOptional({
        description: 'Meter manufacturer name',
        example: 'TaxiMeter Pro',
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    manufacturer?: string;

    @ApiPropertyOptional({
        description: 'Meter model name',
        example: 'TM-2000',
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    model?: string;

    @ApiPropertyOptional({
        description: 'Firmware version installed on the meter',
        example: 'v2.1.0',
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    firmwareVersion?: string;

    @ApiPropertyOptional({
        description: 'Date when the meter was installed',
        example: '2024-01-15',
    })
    @IsOptional()
    @IsDateString()
    installationDate?: string;

    @ApiPropertyOptional({
        description: 'Date of last calibration',
        example: '2024-01-15',
    })
    @IsOptional()
    @IsDateString()
    lastCalibration?: string;

    @ApiPropertyOptional({
        description: 'Date when next calibration is due',
        example: '2024-07-15',
    })
    @IsOptional()
    @IsDateString()
    nextCalibrationDue?: string;

    @ApiPropertyOptional({
        description: 'Current status of the meter',
        enum: Object.values(MeterStatusEnum),
        example: MeterStatusEnum.ACTIVE,
    })
    @IsOptional()
    @IsEnum(MeterStatusEnum)
    status?: string;

    @ApiPropertyOptional({
        description: 'Encryption key for secure data transmission',
        example: 'encryption-key-123',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    encryptionKey?: string;
}

export class MeterQueryDto {
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
        description: 'Search term for meter serial, manufacturer, or model',
        example: 'MTR-2024',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Filter by meter status',
        enum: Object.values(MeterStatusEnum),
        example: MeterStatusEnum.ACTIVE,
    })
    @IsOptional()
    @IsEnum(MeterStatusEnum)
    status?: string;

    @ApiPropertyOptional({
        description: 'Filter by vehicle ID',
        example: 1,
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    vehicleId?: number;

    @ApiPropertyOptional({
        description: 'Filter by manufacturer',
        example: 'TaxiMeter Pro',
    })
    @IsOptional()
    @IsString()
    manufacturer?: string;

    @ApiPropertyOptional({
        description: 'Sort field',
        enum: [
            'meterSerial',
            'manufacturer',
            'model',
            'installationDate',
            'lastCalibration',
            'status',
            'createdAt',
        ],
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

export class AssignMeterToVehicleDto {
    @ApiProperty({ description: 'Meter ID' })
    @IsNotEmpty()
    @IsUUID()
    meterId: string;

    @ApiProperty({ description: 'Vehicle ID' })
    @IsNotEmpty()
    @IsUUID()
    vehicleId: string;
}

export class CalibrateMeterDto {
    @ApiProperty({
        description: 'Date of calibration',
        example: '2024-01-15',
    })
    @IsDateString()
    calibrationDate: string;

    @ApiPropertyOptional({
        description: 'Notes about the calibration',
        example: 'Annual calibration completed successfully',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}

export class UpdateMeterStatusDto {
    @ApiProperty({
        description: 'New status for the meter',
        enum: Object.values(MeterStatusEnum),
        example: MeterStatusEnum.MAINTENANCE,
    })
    @IsEnum(MeterStatusEnum)
    status: string;

    @ApiPropertyOptional({
        description: 'Reason for status change',
        example: 'Scheduled maintenance',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
}
