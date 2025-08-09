import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsBoolean,
    IsEnum,
    IsNumber,
    IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CameroonRegionEnum, CameroonRegionCodesEnum } from '../../common/enum/region.enum';
import { CityEnum } from '../../common/enum/city.enum';

// Region DTOs
export class CreateRegionDto {
    @ApiProperty({ description: 'Region name', enum: CameroonRegionEnum })
    @IsNotEmpty()
    @IsEnum(CameroonRegionEnum)
    name: string;

    @ApiProperty({ description: 'Region code', enum: CameroonRegionCodesEnum })
    @IsNotEmpty()
    @IsEnum(CameroonRegionCodesEnum)
    code: string;

    @ApiProperty({ description: 'Capital city of the region', required: false })
    @IsOptional()
    @IsString()
    capitalCity?: string;
}

export class UpdateRegionDto {
    @ApiProperty({ description: 'Region name', enum: CameroonRegionEnum, required: false })
    @IsOptional()
    @IsEnum(CameroonRegionEnum)
    name?: string;

    @ApiProperty({ description: 'Region code', enum: CameroonRegionCodesEnum, required: false })
    @IsOptional()
    @IsEnum(CameroonRegionCodesEnum)
    code?: string;

    @ApiProperty({ description: 'Capital city of the region', required: false })
    @IsOptional()
    @IsString()
    capitalCity?: string;
}

export class RegionQueryDto {
    @ApiProperty({ description: 'Search by region name', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'Search by region code', required: false })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiProperty({ description: 'Page number', required: false, default: 1 })
    @IsOptional()
    @IsNumber()
    page?: number = 1;

    @ApiProperty({ description: 'Items per page', required: false, default: 10 })
    @IsOptional()
    @IsNumber()
    limit?: number = 10;
}

// City DTOs
export class CreateCityDto {
    @ApiProperty({ description: 'Region ID' })
    @IsNotEmpty()
    @IsUUID()
    regionId: string;

    @ApiProperty({ description: 'City name', enum: CityEnum })
    @IsNotEmpty()
    @IsEnum(CityEnum)
    name: string;

    @ApiProperty({ description: 'Whether this is a major city', required: false, default: false })
    @IsOptional()
    @IsBoolean()
    isMajorCity?: boolean;
}

export class UpdateCityDto {
    @ApiProperty({ description: 'Region ID', required: false })
    @IsOptional()
    @IsUUID()
    regionId?: string;

    @ApiProperty({ description: 'City name', enum: CityEnum, required: false })
    @IsOptional()
    @IsEnum(CityEnum)
    name?: string;

    @ApiProperty({ description: 'Whether this is a major city', required: false })
    @IsOptional()
    @IsBoolean()
    isMajorCity?: boolean;
}

export class CityQueryDto {
    @ApiProperty({ description: 'Search by city name', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'Filter by region ID', required: false })
    @IsOptional()
    @IsUUID()
    regionId?: string;

    @ApiProperty({ description: 'Filter by major city status', required: false })
    @IsOptional()
    @IsBoolean()
    isMajorCity?: boolean;

    @ApiProperty({ description: 'Page number', required: false, default: 1 })
    @IsOptional()
    @IsNumber()
    page?: number = 1;

    @ApiProperty({ description: 'Items per page', required: false, default: 10 })
    @IsOptional()
    @IsNumber()
    limit?: number = 10;
}
