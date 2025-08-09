import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Region } from '../../entities/region.entity';
import { City } from '../../entities/city.entity';
import { CityEnum } from '../../common/enum/city.enum';
import {
    CreateRegionDto,
    UpdateRegionDto,
    RegionQueryDto,
    CreateCityDto,
    UpdateCityDto,
    CityQueryDto,
} from '../../dto/request/geography.dto';
import {
    RegionResponseDto,
    RegionListResponseDto,
    RegionCreatedResponseDto,
    RegionUpdatedResponseDto,
    RegionDeletedResponseDto,
    RegionWithCitiesResponseDto,
    CityResponseDto,
    CityListResponseDto,
    CityCreatedResponseDto,
    CityUpdatedResponseDto,
    CityDeletedResponseDto,
    GeographyStatsResponseDto,
} from '../../dto/response/geography.dto';

@Injectable()
export class GeographyService {
    constructor(
        @InjectRepository(Region)
        private regionRepository: Repository<Region>,
        @InjectRepository(City)
        private cityRepository: Repository<City>,
    ) {}

    // Region Methods
    async createRegion(createRegionDto: CreateRegionDto): Promise<RegionCreatedResponseDto> {
        // Check if region with same name or code already exists
        const existingRegion = await this.regionRepository.findOne({
            where: [{ name: createRegionDto.name }, { code: createRegionDto.code }],
        });

        if (existingRegion) {
            throw new ConflictException('Region with this name or code already exists');
        }

        const region = this.regionRepository.create(createRegionDto);
        const savedRegion = await this.regionRepository.save(region);
        const regionResponse = await this.mapToRegionResponse(savedRegion);

        return {
            message: 'Region created successfully',
            region: regionResponse,
        };
    }

    async findAllRegions(queryDto: RegionQueryDto): Promise<RegionListResponseDto> {
        const { page = 1, limit = 10, name, code } = queryDto;

        const whereConditions: FindOptionsWhere<Region> = {};

        if (name) {
            whereConditions.name = Like(`%${name}%`);
        }

        if (code) {
            whereConditions.code = Like(`%${code}%`);
        }

        const skip = (page - 1) * limit;

        const [regions, total] = await this.regionRepository.findAndCount({
            where: whereConditions,
            skip,
            take: limit,
            order: { name: 'ASC' },
        });

        const totalPages = Math.ceil(total / limit);
        const regionResponses = await Promise.all(
            regions.map((region) => this.mapToRegionResponse(region)),
        );

        return {
            regions: regionResponses,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findRegionById(id: string): Promise<RegionResponseDto> {
        const region = await this.regionRepository.findOne({
            where: { id },
        });

        if (!region) {
            throw new NotFoundException(`Region with ID ${id} not found`);
        }

        return this.mapToRegionResponse(region);
    }

    async findRegionWithCities(id: string): Promise<RegionWithCitiesResponseDto> {
        const region = await this.regionRepository.findOne({
            where: { id },
            relations: ['cities'],
        });

        if (!region) {
            throw new NotFoundException(`Region with ID ${id} not found`);
        }

        const regionResponse = await this.mapToRegionResponse(region);
        const cityResponses = await Promise.all(
            region.cities.map((city) => this.mapToCityResponse(city)),
        );

        return {
            ...regionResponse,
            cities: cityResponses,
        };
    }

    async updateRegion(
        id: string,
        updateRegionDto: UpdateRegionDto,
    ): Promise<RegionUpdatedResponseDto> {
        const region = await this.regionRepository.findOne({
            where: { id },
        });

        if (!region) {
            throw new NotFoundException(`Region with ID ${id} not found`);
        }

        // Check if updated name or code conflicts with existing regions
        if (updateRegionDto.name || updateRegionDto.code) {
            const existingRegion = await this.regionRepository.findOne({
                where: [
                    { name: updateRegionDto.name || region.name },
                    { code: updateRegionDto.code || region.code },
                ],
            });

            if (existingRegion && existingRegion.id !== id) {
                throw new ConflictException('Region with this name or code already exists');
            }
        }

        await this.regionRepository.update(id, updateRegionDto);

        const updatedRegion = await this.regionRepository.findOne({
            where: { id },
        });

        return {
            message: 'Region updated successfully',
            region: await this.mapToRegionResponse(updatedRegion),
        };
    }

    async deleteRegion(id: string): Promise<RegionDeletedResponseDto> {
        const region = await this.regionRepository.findOne({
            where: { id },
            relations: ['cities', 'users'],
        });

        if (!region) {
            throw new NotFoundException(`Region with ID ${id} not found`);
        }

        // Check if region has associated cities or users
        if (region.cities.length > 0) {
            throw new ConflictException('Cannot delete region with associated cities');
        }

        if (region.users.length > 0) {
            throw new ConflictException('Cannot delete region with associated users');
        }

        await this.regionRepository.remove(region);

        return {
            message: 'Region deleted successfully',
            regionId: id,
        };
    }

    // City Methods
    async createCity(createCityDto: CreateCityDto): Promise<CityCreatedResponseDto> {
        // Check if region exists
        const region = await this.regionRepository.findOne({
            where: { id: createCityDto.regionId },
        });

        if (!region) {
            throw new NotFoundException(`Region with ID ${createCityDto.regionId} not found`);
        }

        // Check if city with same name in the same region already exists
        const existingCity = await this.cityRepository.findOne({
            where: {
                name: createCityDto.name as CityEnum,
                regionId: createCityDto.regionId,
            },
        });

        if (existingCity) {
            throw new ConflictException('City with this name already exists in this region');
        }

        const city = this.cityRepository.create({
            regionId: createCityDto.regionId,
            name: createCityDto.name as CityEnum,
            isMajorCity: createCityDto.isMajorCity || false,
        });

        const savedCity = await this.cityRepository.save(city);
        const cityResponse = await this.mapToCityResponse(savedCity);

        return {
            message: 'City created successfully',
            city: cityResponse,
        };
    }

    async findAllCities(queryDto: CityQueryDto): Promise<CityListResponseDto> {
        const { page = 1, limit = 10, name, regionId, isMajorCity } = queryDto;

        const whereConditions: FindOptionsWhere<City> = {};

        if (name) {
            whereConditions.name = Like(`%${name}%`) as any;
        }

        if (regionId) {
            whereConditions.regionId = regionId;
        }

        if (isMajorCity !== undefined) {
            whereConditions.isMajorCity = isMajorCity;
        }

        const skip = (page - 1) * limit;

        const [cities, total] = await this.cityRepository.findAndCount({
            where: whereConditions,
            skip,
            take: limit,
            order: { name: 'ASC' },
            relations: ['region'],
        });

        const totalPages = Math.ceil(total / limit);
        const cityResponses = await Promise.all(cities.map((city) => this.mapToCityResponse(city)));

        return {
            cities: cityResponses,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findCityById(id: string): Promise<CityResponseDto> {
        const city = await this.cityRepository.findOne({
            where: { id },
            relations: ['region'],
        });

        if (!city) {
            throw new NotFoundException(`City with ID ${id} not found`);
        }

        return this.mapToCityResponse(city);
    }

    async findCitiesByRegion(regionId: string): Promise<CityResponseDto[]> {
        const region = await this.regionRepository.findOne({
            where: { id: regionId },
        });

        if (!region) {
            throw new NotFoundException(`Region with ID ${regionId} not found`);
        }

        const cities = await this.cityRepository.find({
            where: { regionId },
            relations: ['region'],
            order: { name: 'ASC' },
        });

        return Promise.all(cities.map((city) => this.mapToCityResponse(city)));
    }

    async findMajorCities(): Promise<CityResponseDto[]> {
        const cities = await this.cityRepository.find({
            where: { isMajorCity: true },
            relations: ['region'],
            order: { name: 'ASC' },
        });

        return Promise.all(cities.map((city) => this.mapToCityResponse(city)));
    }

    async updateCity(id: string, updateCityDto: UpdateCityDto): Promise<CityUpdatedResponseDto> {
        const city = await this.cityRepository.findOne({
            where: { id },
            relations: ['region'],
        });

        if (!city) {
            throw new NotFoundException(`City with ID ${id} not found`);
        }

        // Check if region exists if regionId is being updated
        if (updateCityDto.regionId && updateCityDto.regionId !== city.regionId) {
            const region = await this.regionRepository.findOne({
                where: { id: updateCityDto.regionId },
            });

            if (!region) {
                throw new NotFoundException(`Region with ID ${updateCityDto.regionId} not found`);
            }
        }

        // Check if city name conflicts in the same region
        if (updateCityDto.name && updateCityDto.name !== city.name) {
            const existingCity = await this.cityRepository.findOne({
                where: {
                    name: updateCityDto.name as CityEnum,
                    regionId: updateCityDto.regionId || city.regionId,
                },
            });

            if (existingCity && existingCity.id !== id) {
                throw new ConflictException('City with this name already exists in this region');
            }
        }

        const updateData: any = {};
        if (updateCityDto.regionId !== undefined) updateData.regionId = updateCityDto.regionId;
        if (updateCityDto.name !== undefined) updateData.name = updateCityDto.name as CityEnum;
        if (updateCityDto.isMajorCity !== undefined)
            updateData.isMajorCity = updateCityDto.isMajorCity;

        await this.cityRepository.update(id, updateData);

        const updatedCity = await this.cityRepository.findOne({
            where: { id },
            relations: ['region'],
        });

        return {
            message: 'City updated successfully',
            city: await this.mapToCityResponse(updatedCity),
        };
    }

    async deleteCity(id: string): Promise<CityDeletedResponseDto> {
        const city = await this.cityRepository.findOne({
            where: { id },
            relations: ['drivers'],
        });

        if (!city) {
            throw new NotFoundException(`City with ID ${id} not found`);
        }

        // Check if city has associated drivers
        if (city.drivers.length > 0) {
            throw new ConflictException('Cannot delete city with associated drivers');
        }

        await this.cityRepository.remove(city);

        return {
            message: 'City deleted successfully',
            cityId: id,
        };
    }

    // Statistics Methods
    async getGeographyStats(): Promise<GeographyStatsResponseDto> {
        const [totalRegions, totalCities, majorCities] = await Promise.all([
            this.regionRepository.count(),
            this.cityRepository.count(),
            this.cityRepository.count({ where: { isMajorCity: true } }),
        ]);

        // Get cities by region
        const citiesByRegionData = await this.cityRepository
            .createQueryBuilder('city')
            .select('region.name', 'regionName')
            .addSelect('COUNT(*)', 'count')
            .leftJoin('city.region', 'region')
            .groupBy('region.name')
            .getRawMany();

        const citiesByRegion = {};
        citiesByRegionData.forEach((item) => {
            citiesByRegion[item.regionName] = parseInt(item.count);
        });

        // Get major cities by region
        const majorCitiesByRegionData = await this.cityRepository
            .createQueryBuilder('city')
            .select('region.name', 'regionName')
            .addSelect('COUNT(*)', 'count')
            .leftJoin('city.region', 'region')
            .where('city.isMajorCity = :isMajorCity', { isMajorCity: true })
            .groupBy('region.name')
            .getRawMany();

        const majorCitiesByRegion = {};
        majorCitiesByRegionData.forEach((item) => {
            majorCitiesByRegion[item.regionName] = parseInt(item.count);
        });

        return {
            totalRegions,
            totalCities,
            majorCities,
            citiesByRegion,
            majorCitiesByRegion,
        };
    }

    // Helper Methods
    private async mapToRegionResponse(region: Region): Promise<RegionResponseDto> {
        const cityCount = await this.cityRepository.count({
            where: { regionId: region.id },
        });

        return {
            id: region.id,
            name: region.name,
            code: region.code,
            capitalCity: region.capitalCity,
            cityCount,
            createdAt: region.createdAt,
            updatedAt: region.updatedAt,
        };
    }

    private async mapToCityResponse(city: City): Promise<CityResponseDto> {
        return {
            id: city.id,
            name: city.name,
            regionId: city.regionId,
            regionName: city.region?.name || 'Unknown Region',
            regionCode: city.region?.code || 'N/A',
            isMajorCity: city.isMajorCity,
            createdAt: city.createdAt,
            updatedAt: city.updatedAt,
        };
    }
}
