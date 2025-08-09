import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Between } from 'typeorm';
import { FareRate } from '../../entities/fare-rates.entity';
import { RegionalFareMultiplier } from '../../entities/regional-fare-rates.entity';
import { VehicleType } from '../../entities/vehicle-type.entity';
import { Region } from '../../entities/region.entity';
import {
    CreateFareRateDto,
    UpdateFareRateDto,
    CreateRegionalFareMultiplierDto,
    UpdateRegionalFareMultiplierDto,
    FareCalculationDto,
    FareRateQueryDto,
    RegionalMultiplierQueryDto,
} from '../../dto/request/fare.dto';
import {
    FareRateResponseDto,
    RegionalFareMultiplierResponseDto,
    FareCalculationResponseDto,
    FareRateListResponseDto,
    RegionalMultiplierListResponseDto,
    FareStatisticsResponseDto,
} from '../../dto/response/fare.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class FareService {
    constructor(
        @InjectRepository(FareRate)
        private readonly fareRateRepository: Repository<FareRate>,
        @InjectRepository(RegionalFareMultiplier)
        private readonly regionalMultiplierRepository: Repository<RegionalFareMultiplier>,
        @InjectRepository(VehicleType)
        private readonly vehicleTypeRepository: Repository<VehicleType>,
        @InjectRepository(Region)
        private readonly regionRepository: Repository<Region>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    // Fare Rate Management
    async createFareRate(createFareRateDto: CreateFareRateDto): Promise<FareRateResponseDto> {
        // Check if vehicle type exists
        const vehicleType = await this.vehicleTypeRepository.findOne({
            where: { id: createFareRateDto.vehicleTypeId },
        });

        if (!vehicleType) {
            throw new NotFoundException('Vehicle type not found');
        }

        // Check if there's already an active fare rate for this vehicle type
        const existingActiveRate = await this.fareRateRepository.findOne({
            where: {
                vehicleTypeId: createFareRateDto.vehicleTypeId,
                isActive: true,
            },
        });

        if (existingActiveRate) {
            throw new ConflictException('An active fare rate already exists for this vehicle type');
        }

        const fareRate = this.fareRateRepository.create({
            ...createFareRateDto,
            effectiveFrom: createFareRateDto.effectiveFrom
                ? new Date(createFareRateDto.effectiveFrom)
                : new Date(),
            effectiveUntil: createFareRateDto.effectiveUntil
                ? new Date(createFareRateDto.effectiveUntil)
                : null,
        });

        const savedFareRate = await this.fareRateRepository.save(fareRate);
        await this.cacheManager.del('fares:list');
        return this.mapToFareRateResponseDto(savedFareRate);
    }

    async findAllFareRates(query: FareRateQueryDto): Promise<FareRateListResponseDto> {
        const {
            page = 1,
            limit = 10,
            vehicleTypeId,
            isActive,
            effectiveDate,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
        } = query;

        const queryBuilder = this.fareRateRepository
            .createQueryBuilder('fareRate')
            .leftJoinAndSelect('fareRate.vehicleType', 'vehicleType');

        // Apply filters
        if (vehicleTypeId) {
            queryBuilder.andWhere('fareRate.vehicleTypeId = :vehicleTypeId', { vehicleTypeId });
        }

        if (isActive !== undefined) {
            queryBuilder.andWhere('fareRate.isActive = :isActive', { isActive });
        }

        if (effectiveDate) {
            const date = new Date(effectiveDate);
            queryBuilder.andWhere(
                'fareRate.effectiveFrom <= :effectiveDate AND (fareRate.effectiveUntil IS NULL OR fareRate.effectiveUntil >= :effectiveDate)',
                { effectiveDate: date },
            );
        }

        // Apply sorting
        queryBuilder.orderBy(`fareRate.${sortBy}`, sortOrder as 'ASC' | 'DESC');

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        const [fareRates, total] = await queryBuilder.getManyAndCount();

        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            data: fareRates.map((rate) => this.mapToFareRateResponseDto(rate)),
            total,
            page,
            limit,
            totalPages,
            hasNextPage,
            hasPrevPage,
        };
    }

    async findFareRateById(id: string): Promise<FareRateResponseDto> {
        const fareRate = await this.fareRateRepository.findOne({
            where: { id },
            relations: ['vehicleType'],
        });

        if (!fareRate) {
            throw new NotFoundException('Fare rate not found');
        }

        return this.mapToFareRateResponseDto(fareRate);
    }

    async findActiveFareRateByVehicleType(vehicleTypeId: string): Promise<FareRateResponseDto> {
        const fareRate = await this.fareRateRepository.findOne({
            where: {
                vehicleTypeId,
                isActive: true,
                effectiveFrom: LessThanOrEqual(new Date()),
                effectiveUntil: MoreThanOrEqual(new Date()),
            },
            relations: ['vehicleType'],
        });

        if (!fareRate) {
            throw new NotFoundException('Active fare rate not found for this vehicle type');
        }

        return this.mapToFareRateResponseDto(fareRate);
    }

    async getFareRatesByRegion(regionId: string): Promise<FareRateListResponseDto> {
        // Get all active fare rates
        const fareRates = await this.fareRateRepository.find({
            where: {
                isActive: true,
                effectiveFrom: LessThanOrEqual(new Date()),
                effectiveUntil: MoreThanOrEqual(new Date()),
            },
            relations: ['vehicleType'],
        });

        // Get regional multiplier for the region
        const regionalMultiplier = await this.regionalMultiplierRepository.findOne({
            where: {
                regionId,
                isActive: true,
                effectiveFrom: LessThanOrEqual(new Date()),
                effectiveUntil: MoreThanOrEqual(new Date()),
            },
        });

        // Create adjusted response DTOs
        const adjustedFareRates = fareRates.map((rate) => {
            const baseResponse = this.mapToFareRateResponseDto(rate);
            if (regionalMultiplier) {
                return {
                    ...baseResponse,
                    baseFare: rate.baseFare * regionalMultiplier.multiplier,
                    perKmRate: rate.perKmRate * regionalMultiplier.multiplier,
                };
            }
            return baseResponse;
        });

        return {
            data: adjustedFareRates,
            total: adjustedFareRates.length,
            page: 1,
            limit: adjustedFareRates.length,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
        };
    }

    async updateFareRate(
        id: string,
        updateFareRateDto: UpdateFareRateDto,
    ): Promise<FareRateResponseDto> {
        const fareRate = await this.fareRateRepository.findOne({
            where: { id },
        });

        if (!fareRate) {
            throw new NotFoundException('Fare rate not found');
        }

        // If vehicle type is being updated, verify it exists
        if (
            updateFareRateDto.vehicleTypeId &&
            updateFareRateDto.vehicleTypeId !== fareRate.vehicleTypeId
        ) {
            const vehicleType = await this.vehicleTypeRepository.findOne({
                where: { id: updateFareRateDto.vehicleTypeId },
            });

            if (!vehicleType) {
                throw new NotFoundException('Vehicle type not found');
            }
        }

        Object.assign(fareRate, {
            ...updateFareRateDto,
            effectiveFrom: updateFareRateDto.effectiveFrom
                ? new Date(updateFareRateDto.effectiveFrom)
                : fareRate.effectiveFrom,
            effectiveUntil: updateFareRateDto.effectiveUntil
                ? new Date(updateFareRateDto.effectiveUntil)
                : fareRate.effectiveUntil,
        });

        const updatedFareRate = await this.fareRateRepository.save(fareRate);
        await this.cacheManager.del(`fare:${id}`);
        await this.cacheManager.del('fares:list');
        return this.mapToFareRateResponseDto(updatedFareRate);
    }

    async deleteFareRate(id: string): Promise<void> {
        const fareRate = await this.fareRateRepository.findOne({
            where: { id },
        });

        if (!fareRate) {
            throw new NotFoundException('Fare rate not found');
        }

        await this.fareRateRepository.remove(fareRate);
        await this.cacheManager.del(`fare:${id}`);
        await this.cacheManager.del('fares:list');
    }

    // Regional Fare Multiplier Management
    async createRegionalMultiplier(
        createMultiplierDto: CreateRegionalFareMultiplierDto,
    ): Promise<RegionalFareMultiplierResponseDto> {
        // Check if region exists
        const region = await this.regionRepository.findOne({
            where: { id: createMultiplierDto.regionId },
        });

        if (!region) {
            throw new NotFoundException('Region not found');
        }

        // Check if there's already an active multiplier for this region
        const existingActiveMultiplier = await this.regionalMultiplierRepository.findOne({
            where: {
                regionId: createMultiplierDto.regionId,
                isActive: true,
            },
        });

        if (existingActiveMultiplier) {
            throw new ConflictException(
                'An active regional multiplier already exists for this region',
            );
        }

        const multiplier = this.regionalMultiplierRepository.create({
            ...createMultiplierDto,
            effectiveFrom: createMultiplierDto.effectiveFrom
                ? new Date(createMultiplierDto.effectiveFrom)
                : new Date(),
            effectiveUntil: createMultiplierDto.effectiveUntil
                ? new Date(createMultiplierDto.effectiveUntil)
                : null,
        });

        const savedMultiplier = await this.regionalMultiplierRepository.save(multiplier);
        return this.mapToRegionalMultiplierResponseDto(savedMultiplier);
    }

    async findAllRegionalMultipliers(
        query: RegionalMultiplierQueryDto,
    ): Promise<RegionalMultiplierListResponseDto> {
        const {
            page = 1,
            limit = 10,
            regionId,
            isActive,
            effectiveDate,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
        } = query;

        const queryBuilder = this.regionalMultiplierRepository
            .createQueryBuilder('multiplier')
            .leftJoinAndSelect('multiplier.region', 'region');

        // Apply filters
        if (regionId) {
            queryBuilder.andWhere('multiplier.regionId = :regionId', { regionId });
        }

        if (isActive !== undefined) {
            queryBuilder.andWhere('multiplier.isActive = :isActive', { isActive });
        }

        if (effectiveDate) {
            const date = new Date(effectiveDate);
            queryBuilder.andWhere(
                'multiplier.effectiveFrom <= :effectiveDate AND (multiplier.effectiveUntil IS NULL OR multiplier.effectiveUntil >= :effectiveDate)',
                { effectiveDate: date },
            );
        }

        // Apply sorting
        queryBuilder.orderBy(`multiplier.${sortBy}`, sortOrder as 'ASC' | 'DESC');

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        const [multipliers, total] = await queryBuilder.getManyAndCount();

        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            data: multipliers.map((multiplier) =>
                this.mapToRegionalMultiplierResponseDto(multiplier),
            ),
            total,
            page,
            limit,
            totalPages,
            hasNextPage,
            hasPrevPage,
        };
    }

    async findRegionalMultiplierById(id: string): Promise<RegionalFareMultiplierResponseDto> {
        const multiplier = await this.regionalMultiplierRepository.findOne({
            where: { id },
            relations: ['region'],
        });

        if (!multiplier) {
            throw new NotFoundException('Regional multiplier not found');
        }

        return this.mapToRegionalMultiplierResponseDto(multiplier);
    }

    async findActiveRegionalMultiplierByRegion(
        regionId: string,
    ): Promise<RegionalFareMultiplierResponseDto> {
        const multiplier = await this.regionalMultiplierRepository.findOne({
            where: {
                regionId,
                isActive: true,
                effectiveFrom: LessThanOrEqual(new Date()),
                effectiveUntil: MoreThanOrEqual(new Date()),
            },
            relations: ['region'],
        });

        if (!multiplier) {
            throw new NotFoundException('Active regional multiplier not found for this region');
        }

        return this.mapToRegionalMultiplierResponseDto(multiplier);
    }

    async updateRegionalMultiplier(
        id: string,
        updateMultiplierDto: UpdateRegionalFareMultiplierDto,
    ): Promise<RegionalFareMultiplierResponseDto> {
        const multiplier = await this.regionalMultiplierRepository.findOne({
            where: { id },
        });

        if (!multiplier) {
            throw new NotFoundException('Regional multiplier not found');
        }

        // If region is being updated, verify it exists
        if (updateMultiplierDto.regionId && updateMultiplierDto.regionId !== multiplier.regionId) {
            const region = await this.regionRepository.findOne({
                where: { id: updateMultiplierDto.regionId },
            });

            if (!region) {
                throw new NotFoundException('Region not found');
            }
        }

        Object.assign(multiplier, {
            ...updateMultiplierDto,
            effectiveFrom: updateMultiplierDto.effectiveFrom
                ? new Date(updateMultiplierDto.effectiveFrom)
                : multiplier.effectiveFrom,
            effectiveUntil: updateMultiplierDto.effectiveUntil
                ? new Date(updateMultiplierDto.effectiveUntil)
                : multiplier.effectiveUntil,
        });

        const updatedMultiplier = await this.regionalMultiplierRepository.save(multiplier);
        return this.mapToRegionalMultiplierResponseDto(updatedMultiplier);
    }

    async deleteRegionalMultiplier(id: string): Promise<void> {
        const multiplier = await this.regionalMultiplierRepository.findOne({
            where: { id },
        });

        if (!multiplier) {
            throw new NotFoundException('Regional multiplier not found');
        }

        await this.regionalMultiplierRepository.remove(multiplier);
    }

    // Fare Calculation
    async calculateFare(calculationDto: FareCalculationDto): Promise<FareCalculationResponseDto> {
        // Get active fare rate for vehicle type
        const fareRate = await this.fareRateRepository.findOne({
            where: {
                vehicleTypeId: calculationDto.vehicleTypeId,
                isActive: true,
                effectiveFrom: LessThanOrEqual(new Date()),
                effectiveUntil: MoreThanOrEqual(new Date()),
            },
        });

        if (!fareRate) {
            throw new NotFoundException('Active fare rate not found for this vehicle type');
        }

        // Get regional multiplier if region is specified
        let regionalMultiplier = null;
        if (calculationDto.regionId) {
            regionalMultiplier = await this.regionalMultiplierRepository.findOne({
                where: {
                    regionId: calculationDto.regionId,
                    isActive: true,
                    effectiveFrom: LessThanOrEqual(new Date()),
                    effectiveUntil: MoreThanOrEqual(new Date()),
                },
            });
        }

        // Calculate fare components
        const baseFare = fareRate.baseFare;
        const distanceFare = Math.round(calculationDto.distance * fareRate.perKmRate);
        const waitingFare = Math.round((calculationDto.waitingTime || 0) * 5); // 5 CFA per minute
        const subtotal = baseFare + distanceFare + waitingFare;

        // Apply multipliers
        const nightMultiplier = calculationDto.isNightTrip ? fareRate.nightMultiplier : 1.0;
        const regionalMultiplierValue = regionalMultiplier ? regionalMultiplier.multiplier : 1.0;
        const customMultiplier = calculationDto.customMultiplier || 1.0;

        const totalMultiplier = nightMultiplier * regionalMultiplierValue * customMultiplier;
        const totalFare = Math.round(subtotal * totalMultiplier);

        // Prepare breakdown
        const multipliers = [];
        if (calculationDto.isNightTrip) {
            multipliers.push(`night: ${nightMultiplier}`);
        }
        if (regionalMultiplier) {
            multipliers.push(`regional: ${regionalMultiplierValue}`);
        }
        if (calculationDto.customMultiplier) {
            multipliers.push(`custom: ${customMultiplier}`);
        }

        return {
            vehicleTypeId: calculationDto.vehicleTypeId,
            distance: calculationDto.distance,
            regionId: calculationDto.regionId,
            isNightTrip: calculationDto.isNightTrip || false,
            waitingTime: calculationDto.waitingTime || 0,
            baseFare,
            distanceFare,
            waitingFare,
            subtotal,
            nightMultiplier,
            regionalMultiplier: regionalMultiplierValue,
            customMultiplier: calculationDto.customMultiplier,
            totalFare,
            breakdown: {
                baseFare,
                distanceFare,
                waitingFare,
                multipliers,
            },
            calculatedAt: new Date(),
        };
    }

    // Statistics and Reporting
    async getFareStatistics(): Promise<FareStatisticsResponseDto> {
        const [
            totalFareRates,
            activeFareRates,
            inactiveFareRates,
            totalRegionalMultipliers,
            activeRegionalMultipliers,
            averageBaseFare,
            averagePerKmRate,
            averageRegionalMultiplier,
            fareRatesByVehicleType,
            multipliersByRegion,
            expiringSoon,
        ] = await Promise.all([
            this.fareRateRepository.count(),
            this.fareRateRepository.count({ where: { isActive: true } }),
            this.fareRateRepository.count({ where: { isActive: false } }),
            this.regionalMultiplierRepository.count(),
            this.regionalMultiplierRepository.count({ where: { isActive: true } }),
            this.fareRateRepository
                .createQueryBuilder('fareRate')
                .select('AVG(fareRate.baseFare)', 'average')
                .where('fareRate.isActive = :isActive', { isActive: true })
                .getRawOne(),
            this.fareRateRepository
                .createQueryBuilder('fareRate')
                .select('AVG(fareRate.perKmRate)', 'average')
                .where('fareRate.isActive = :isActive', { isActive: true })
                .getRawOne(),
            this.regionalMultiplierRepository
                .createQueryBuilder('multiplier')
                .select('AVG(multiplier.multiplier)', 'average')
                .where('multiplier.isActive = :isActive', { isActive: true })
                .getRawOne(),
            this.fareRateRepository
                .createQueryBuilder('fareRate')
                .leftJoin('fareRate.vehicleType', 'vehicleType')
                .select('vehicleType.typeName', 'typeName')
                .addSelect('COUNT(*)', 'count')
                .where('fareRate.isActive = :isActive', { isActive: true })
                .groupBy('vehicleType.typeName')
                .getRawMany(),
            this.regionalMultiplierRepository
                .createQueryBuilder('multiplier')
                .leftJoin('multiplier.region', 'region')
                .select('region.name', 'regionName')
                .addSelect('multiplier.multiplier', 'multiplier')
                .where('multiplier.isActive = :isActive', { isActive: true })
                .getRawMany(),
            this.fareRateRepository.count({
                where: {
                    effectiveUntil: Between(
                        new Date(),
                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    ),
                },
            }),
        ]);

        const vehicleTypeStats = fareRatesByVehicleType.reduce(
            (acc, item) => {
                acc[item.typeName] = parseInt(item.count);
                return acc;
            },
            {} as Record<string, number>,
        );

        const regionStats = multipliersByRegion.reduce(
            (acc, item) => {
                acc[item.regionName] = parseFloat(item.multiplier);
                return acc;
            },
            {} as Record<string, number>,
        );

        return {
            totalFareRates,
            activeFareRates,
            inactiveFareRates,
            totalRegionalMultipliers,
            activeRegionalMultipliers,
            averageBaseFare: parseFloat(averageBaseFare?.average || '0'),
            averagePerKmRate: parseFloat(averagePerKmRate?.average || '0'),
            averageRegionalMultiplier: parseFloat(averageRegionalMultiplier?.average || '0'),
            fareRatesByVehicleType: vehicleTypeStats,
            multipliersByRegion: regionStats,
            expiringSoon,
        };
    }

    // Helper methods
    private mapToFareRateResponseDto(fareRate: FareRate): FareRateResponseDto {
        return {
            id: fareRate.id,
            vehicleTypeId: fareRate.vehicleTypeId,
            baseFare: fareRate.baseFare,
            perKmRate: fareRate.perKmRate,
            nightMultiplier: fareRate.nightMultiplier,
            effectiveFrom: fareRate.effectiveFrom,
            effectiveUntil: fareRate.effectiveUntil,
            isActive: fareRate.isActive,
            notes: fareRate.notes,
            createdAt: fareRate.createdAt,
            updatedAt: fareRate.updatedAt,
        };
    }

    private mapToRegionalMultiplierResponseDto(
        multiplier: RegionalFareMultiplier,
    ): RegionalFareMultiplierResponseDto {
        return {
            id: multiplier.id,
            regionId: multiplier.regionId,
            multiplier: multiplier.multiplier,
            reason: multiplier.reason,
            effectiveFrom: multiplier.effectiveFrom,
            effectiveUntil: multiplier.effectiveUntil,
            isActive: multiplier.isActive,
            createdAt: multiplier.createdAt,
            updatedAt: multiplier.updatedAt,
        };
    }
}
