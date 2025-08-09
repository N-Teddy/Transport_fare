import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNumber,
    IsOptional,
    IsDateString,
    IsBoolean,
    IsEnum,
    IsArray,
    Min,
    Max,
    Length,
    IsInt,
    IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { VehicleTypeEnum } from 'src/common/enum/global.enum';

// Vehicle Type DTOs
export class CreateVehicleTypeDto {
    @ApiProperty({
        description: 'Vehicle type name',
        enum: VehicleTypeEnum,
        example: 'taxi',
    })
    @IsEnum(VehicleTypeEnum)
    typeName: string;

    @ApiPropertyOptional({
        description: 'Vehicle type description',
        example: 'Standard taxi vehicle for passenger transport',
    })
    @IsOptional()
    @IsString()
    @Length(1, 500)
    description?: string;

    @ApiPropertyOptional({
        description: 'Maximum number of passengers',
        example: 4,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(50)
    maxPassengers?: number;

    @ApiPropertyOptional({
        description: 'Whether helmet is required',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    requiresHelmet?: boolean;
}

export class UpdateVehicleTypeDto {
    @ApiPropertyOptional({
        description: 'Vehicle type name',
        enum: VehicleTypeEnum,
    })
    @IsOptional()
    @IsEnum(VehicleTypeEnum)
    typeName?: string;

    @ApiPropertyOptional({
        description: 'Vehicle type description',
    })
    @IsOptional()
    @IsString()
    @Length(1, 500)
    description?: string;

    @ApiPropertyOptional({
        description: 'Maximum number of passengers',
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(50)
    maxPassengers?: number;

    @ApiPropertyOptional({
        description: 'Whether helmet is required',
    })
    @IsOptional()
    @IsBoolean()
    requiresHelmet?: boolean;
}

// Vehicle DTOs
export class CreateVehicleDto {
    @ApiProperty({
        description: 'Vehicle type ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    vehicleTypeId: string;

    @ApiProperty({
        description: 'Vehicle license plate number',
        example: 'ABC123',
    })
    @IsString()
    @Length(3, 20)
    licensePlate: string;

    @ApiPropertyOptional({
        description: 'Vehicle make/brand',
        example: 'Toyota',
    })
    @IsOptional()
    @IsString()
    @Length(1, 50)
    make?: string;

    @ApiPropertyOptional({
        description: 'Vehicle model',
        example: 'Camry',
    })
    @IsOptional()
    @IsString()
    @Length(1, 50)
    model?: string;

    @ApiPropertyOptional({
        description: 'Vehicle manufacturing year',
        example: 2020,
    })
    @IsOptional()
    @IsInt()
    @Min(1900)
    @Max(new Date().getFullYear() + 1)
    year?: number;

    @ApiPropertyOptional({
        description: 'Vehicle color',
        example: 'White',
    })
    @IsOptional()
    @IsString()
    @Length(1, 30)
    color?: string;

    @ApiPropertyOptional({
        description: 'Engine capacity in cc (for motorcycles)',
        example: 150,
    })
    @IsOptional()
    @IsInt()
    @Min(50)
    @Max(5000)
    engineCapacity?: number;

    @ApiPropertyOptional({
        description: 'Insurance policy number',
        example: 'INS123456789',
    })
    @IsOptional()
    @IsString()
    @Length(1, 100)
    insuranceNumber?: string;

    @ApiPropertyOptional({
        description: 'Insurance expiry date',
        example: '2024-12-31',
    })
    @IsOptional()
    @IsDateString()
    insuranceExpiry?: string;

    @ApiPropertyOptional({
        description: 'Vehicle inspection expiry date',
        example: '2024-06-30',
    })
    @IsOptional()
    @IsDateString()
    inspectionExpiry?: string;

    @ApiPropertyOptional({
        description: 'Owner driver ID',
        example: 1,
    })
    @IsOptional()
    @IsUUID()
    ownerDriverId?: string;
}

export class UpdateVehicleDto {
    @ApiPropertyOptional({
        description: 'Vehicle type ID',
    })
    @IsOptional()
    @IsUUID()
    vehicleTypeId?: string;

    @ApiPropertyOptional({
        description: 'Vehicle license plate number',
    })
    @IsOptional()
    @IsString()
    @Length(3, 20)
    licensePlate?: string;

    @ApiPropertyOptional({
        description: 'Vehicle make/brand',
    })
    @IsOptional()
    @IsString()
    @Length(1, 50)
    make?: string;

    @ApiPropertyOptional({
        description: 'Vehicle model',
    })
    @IsOptional()
    @IsString()
    @Length(1, 50)
    model?: string;

    @ApiPropertyOptional({
        description: 'Vehicle manufacturing year',
    })
    @IsOptional()
    @IsInt()
    @Min(1900)
    @Max(new Date().getFullYear() + 1)
    year?: number;

    @ApiPropertyOptional({
        description: 'Vehicle color',
    })
    @IsOptional()
    @IsString()
    @Length(1, 30)
    color?: string;

    @ApiPropertyOptional({
        description: 'Engine capacity in cc (for motorcycles)',
    })
    @IsOptional()
    @IsInt()
    @Min(50)
    @Max(5000)
    engineCapacity?: number;

    @ApiPropertyOptional({
        description: 'Insurance policy number',
    })
    @IsOptional()
    @IsString()
    @Length(1, 100)
    insuranceNumber?: string;

    @ApiPropertyOptional({
        description: 'Insurance expiry date',
    })
    @IsOptional()
    @IsDateString()
    insuranceExpiry?: string;

    @ApiPropertyOptional({
        description: 'Vehicle inspection expiry date',
    })
    @IsOptional()
    @IsDateString()
    inspectionExpiry?: string;

    @ApiPropertyOptional({
        description: 'Owner driver ID',
    })
    @IsOptional()
    @IsUUID()
    ownerDriverId?: string;

    @ApiPropertyOptional({
        description: 'Vehicle status',
        example: 'active',
    })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({
        description: 'Whether photos are verified',
    })
    @IsOptional()
    @IsBoolean()
    photosVerified?: boolean;
}

// Query DTOs
export class VehicleQueryDto {
    @ApiPropertyOptional({
        description: 'Search term for license plate, make, or model',
        example: 'ABC123',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Vehicle type ID filter',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    vehicleTypeId?: number;

    @ApiPropertyOptional({
        description: 'Vehicle status filter',
        example: 'active',
    })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({
        description: 'Owner driver ID filter',
        example: 1,
    })
    @IsOptional()
    @IsString()
    ownerDriverId?: string;

    @ApiPropertyOptional({
        description: 'Filter by photos verification status',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return undefined;
    })
    photosVerified?: boolean;

    @ApiPropertyOptional({
        description: 'Filter by insurance expiry (expired/active)',
        example: 'expired',
    })
    @IsOptional()
    @IsString()
    insuranceStatus?: string;

    @ApiPropertyOptional({
        description: 'Filter by inspection expiry (expired/active)',
        example: 'active',
    })
    @IsOptional()
    @IsString()
    inspectionStatus?: string;

    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Sort field',
        example: 'licensePlate',
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({
        description: 'Sort order',
        example: 'DESC',
    })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class VehicleTypeQueryDto {
    @ApiPropertyOptional({
        description: 'Search term for type name or description',
        example: 'taxi',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Filter by helmet requirement',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return undefined;
    })
    requiresHelmet?: boolean;

    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Sort field',
        example: 'typeName',
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({
        description: 'Sort order',
        example: 'ASC',
    })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'ASC';
}

// Bulk operations
export class BulkUpdateVehicleStatusDto {
    @ApiProperty({
        description: 'Array of vehicle IDs',
        example: [
            '123e4567-e89b-12d3-a456-426614174000',
            '123e4567-e89b-12d3-a456-426614174001',
            '123e4567-e89b-12d3-a456-426614174002',
        ],
    })
    @IsArray()
    @IsNumber({}, { each: true })
    vehicleIds: string[];

    @ApiProperty({
        description: 'New status for all vehicles',
        example: 'inactive',
    })
    @IsString()
    status: string;
}

export class VehiclePhotoVerificationDto {
    @ApiProperty({
        description: 'Vehicle ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsNumber()
    vehicleId: string;

    @ApiProperty({
        description: 'Whether photos are verified',
        example: true,
    })
    @IsBoolean()
    photosVerified: boolean;
}
