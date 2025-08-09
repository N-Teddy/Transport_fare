import { ApiProperty } from '@nestjs/swagger';

// City Response DTOs
export class CityResponseDto {
    @ApiProperty({ description: 'City ID' })
    id: string;

    @ApiProperty({ description: 'City name' })
    name: string;

    @ApiProperty({ description: 'Region ID' })
    regionId: string;

    @ApiProperty({ description: 'Region name' })
    regionName: string;

    @ApiProperty({ description: 'Region code' })
    regionCode: string;

    @ApiProperty({ description: 'Whether this is a major city' })
    isMajorCity: boolean;

    @ApiProperty({ description: 'Account creation date' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    updatedAt: Date;
}

export class CityListResponseDto {
    @ApiProperty({ description: 'List of cities', type: [CityResponseDto] })
    cities: CityResponseDto[];

    @ApiProperty({ description: 'Total number of cities' })
    total: number;

    @ApiProperty({ description: 'Current page' })
    page: number;

    @ApiProperty({ description: 'Items per page' })
    limit: number;

    @ApiProperty({ description: 'Total number of pages' })
    totalPages: number;
}

export class CityCreatedResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'Created city data' })
    city: CityResponseDto;
}

export class CityUpdatedResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'Updated city data' })
    city: CityResponseDto;
}

export class CityDeletedResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'Deleted city ID' })
    cityId: string;
}

// Region Response DTOs
export class RegionResponseDto {
    @ApiProperty({ description: 'Region ID' })
    id: string;

    @ApiProperty({ description: 'Region name' })
    name: string;

    @ApiProperty({ description: 'Region code' })
    code: string;

    @ApiProperty({ description: 'Capital city of the region', required: false })
    capitalCity?: string;

    @ApiProperty({ description: 'Number of cities in this region' })
    cityCount: number;

    @ApiProperty({ description: 'Account creation date' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    updatedAt: Date;
}

export class RegionWithCitiesResponseDto extends RegionResponseDto {
    @ApiProperty({ description: 'Cities in this region', type: [CityResponseDto] })
    cities: CityResponseDto[];
}

export class RegionListResponseDto {
    @ApiProperty({ description: 'List of regions', type: [RegionResponseDto] })
    regions: RegionResponseDto[];

    @ApiProperty({ description: 'Total number of regions' })
    total: number;

    @ApiProperty({ description: 'Current page' })
    page: number;

    @ApiProperty({ description: 'Items per page' })
    limit: number;

    @ApiProperty({ description: 'Total number of pages' })
    totalPages: number;
}

export class RegionCreatedResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'Created region data' })
    region: RegionResponseDto;
}

export class RegionUpdatedResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'Updated region data' })
    region: RegionResponseDto;
}

export class RegionDeletedResponseDto {
    @ApiProperty({ description: 'Success message' })
    message: string;

    @ApiProperty({ description: 'Deleted region ID' })
    regionId: string;
}

// Geography Statistics DTOs
export class GeographyStatsResponseDto {
    @ApiProperty({ description: 'Total number of regions' })
    totalRegions: number;

    @ApiProperty({ description: 'Total number of cities' })
    totalCities: number;

    @ApiProperty({ description: 'Number of major cities' })
    majorCities: number;

    @ApiProperty({ description: 'Cities by region' })
    citiesByRegion: Record<string, number>;

    @ApiProperty({ description: 'Major cities by region' })
    majorCitiesByRegion: Record<string, number>;
}
