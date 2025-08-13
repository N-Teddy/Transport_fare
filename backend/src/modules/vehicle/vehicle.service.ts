import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
    Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Vehicle } from 'src/entities/vehicle.entity';
import { VehicleType } from 'src/entities/vehicle-type.entity';
import { Driver } from 'src/entities/driver.entity';
import {
    CreateVehicleDto,
    UpdateVehicleDto,
    VehicleQueryDto,
    CreateVehicleTypeDto,
    UpdateVehicleTypeDto,
    VehicleTypeQueryDto,
    BulkUpdateVehicleStatusDto,
    VehiclePhotoVerificationDto,
} from 'src/dto/request/vehicle.dto';
import {
    VehicleResponseDto,
    VehicleListResponseDto,
    VehicleTypeResponseDto,
    VehicleTypeListResponseDto,
    VehicleStatisticsDto,
    VehicleTypeStatisticsDto,
    BulkUpdateResponseDto,
    VehiclePhotoVerificationResponseDto,
    VehicleCreatedResponseDto,
    VehicleTypeCreatedResponseDto,
    VehicleTypeUpdatedResponseDto,
    VehicleUpdatedResponseDto,
} from 'src/dto/response/vehicle.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class VehicleService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @InjectRepository(Vehicle)
        private vehicleRepository: Repository<Vehicle>,
        @InjectRepository(VehicleType)
        private vehicleTypeRepository: Repository<VehicleType>,
        @InjectRepository(Driver)
        private driverRepository: Repository<Driver>,
    ) {}

    // Vehicle Type Methods
    async createVehicleType(
        createVehicleTypeDto: CreateVehicleTypeDto,
    ): Promise<VehicleTypeCreatedResponseDto> {
        const existingType = await this.vehicleTypeRepository.findOne({
            where: { typeName: createVehicleTypeDto.typeName },
        });

        if (existingType) {
            throw new ConflictException('Vehicle type with this name already exists');
        }

        const vehicleType = this.vehicleTypeRepository.create(createVehicleTypeDto);
        const savedType = await this.vehicleTypeRepository.save(vehicleType);

        return {
            id: savedType.id,
            typeName: savedType.typeName,
            createdAt: savedType.createdAt,
        };
    }

    async findAllVehicleTypes(query: VehicleTypeQueryDto): Promise<VehicleTypeListResponseDto> {
        const {
            search,
            // requiresHelmet,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'ASC',
        } = query;
        const skip = (page - 1) * limit;

        const queryBuilder = this.vehicleTypeRepository.createQueryBuilder('vehicleType');

        if (search) {
            queryBuilder.where(
                '(vehicleType.typeName ILIKE :search OR vehicleType.description ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        // if (requiresHelmet !== undefined) {
        //     queryBuilder.andWhere('vehicleType.requiresHelmet = :requiresHelmet', {
        //         requiresHelmet,
        //     });
        // }

        const total = await queryBuilder.getCount();
        const data = await queryBuilder
            .orderBy(`vehicleType.${sortBy}`, sortOrder)
            .skip(skip)
            .take(limit)
            .getMany();

        const totalPages = Math.ceil(total / limit);

        return {
            data: data.map((type) => this.mapVehicleTypeToResponse(type)),
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findVehicleTypeById(id: string): Promise<VehicleTypeResponseDto> {
        const vehicleType = await this.vehicleTypeRepository.findOne({
            where: { id },
        });

        if (!vehicleType) {
            throw new NotFoundException('Vehicle type not found');
        }

        return this.mapVehicleTypeToResponse(vehicleType);
    }

    async updateVehicleType(
        id: string,
        updateVehicleTypeDto: UpdateVehicleTypeDto,
    ): Promise<VehicleTypeUpdatedResponseDto> {
        const vehicleType = await this.vehicleTypeRepository.findOne({
            where: { id },
        });

        if (!vehicleType) {
            throw new NotFoundException('Vehicle type not found');
        }

        if (
            updateVehicleTypeDto.typeName &&
            updateVehicleTypeDto.typeName !== vehicleType.typeName
        ) {
            const existingType = await this.vehicleTypeRepository.findOne({
                where: { typeName: updateVehicleTypeDto.typeName },
            });

            if (existingType) {
                throw new ConflictException('Vehicle type with this name already exists');
            }
        }

        Object.assign(vehicleType, updateVehicleTypeDto);
        const updatedType = await this.vehicleTypeRepository.save(vehicleType);

        return {
            message: 'Vehicle type updated successfully',
            vehicleType: this.mapVehicleTypeToResponse(updatedType),
        };
    }

    async deleteVehicleType(id: string): Promise<void> {
        const vehicleType = await this.vehicleTypeRepository.findOne({
            where: { id },
            relations: ['vehicles'],
        });

        if (!vehicleType) {
            throw new NotFoundException('Vehicle type not found');
        }

        if (vehicleType.vehicles && vehicleType.vehicles.length > 0) {
            throw new BadRequestException(
                'Cannot delete vehicle type that has associated vehicles',
            );
        }

        await this.vehicleTypeRepository.remove(vehicleType);
    }

    async getVehicleTypeStatistics(): Promise<VehicleTypeStatisticsDto> {
        try {
            console.log('ok');
            const totalTypes = await this.vehicleTypeRepository.count();
            const requiresHelmet = await this.vehicleTypeRepository.count({
                where: { requiresHelmet: true },
            });

            const types = await this.vehicleTypeRepository.find();
            const byPassengerCapacity: Record<string, number> = {};

            types.forEach((type) => {
                if (type.maxPassengers) {
                    let capacity: string;
                    if (type.maxPassengers <= 2) capacity = '1-2';
                    else if (type.maxPassengers <= 5) capacity = '3-5';
                    else capacity = '6+';

                    byPassengerCapacity[capacity] = (byPassengerCapacity[capacity] || 0) + 1;
                }
            });

            return {
                totalTypes,
                requiresHelmet,
                byPassengerCapacity,
            };
        } catch (error) {
            throw error;
        }
    }

    // Vehicle Methods
    async createVehicle(createVehicleDto: CreateVehicleDto): Promise<VehicleCreatedResponseDto> {
        const vehicleType = await this.vehicleTypeRepository.findOne({
            where: { id: createVehicleDto.vehicleTypeId },
        });

        if (!vehicleType) {
            throw new NotFoundException('Vehicle type not found');
        }

        const existingVehicle = await this.vehicleRepository.findOne({
            where: { licensePlate: createVehicleDto.licensePlate },
        });

        if (existingVehicle) {
            throw new ConflictException('Vehicle with this license plate already exists');
        }

        if (createVehicleDto.ownerDriverId) {
            const driver = await this.driverRepository.findOne({
                where: { id: createVehicleDto.ownerDriverId },
            });

            if (!driver) {
                throw new NotFoundException('Owner driver not found');
            }
        }

        const vehicle = this.vehicleRepository.create({
            ...createVehicleDto,
            registrationDate: new Date(),
            status: 'active',
            photosVerified: false,
        });

        const savedVehicle = await this.vehicleRepository.save(vehicle);

        await this.cacheManager.del('vehicles:list');

        return {
            id: savedVehicle.id,
            licensePlate: savedVehicle.licensePlate,
            createdAt: savedVehicle.createdAt,
        };
    }

    async findAllVehicles(query: VehicleQueryDto): Promise<VehicleListResponseDto> {
        const {
            search,
            vehicleTypeId,
            status,
            ownerDriverId,
            photosVerified,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
        } = query;

        const skip = (page - 1) * limit;
        const queryBuilder = this.vehicleRepository
            .createQueryBuilder('vehicle')
            .leftJoinAndSelect('vehicle.vehicleType', 'vehicleType')
            .leftJoinAndSelect('vehicle.ownerDriver', 'ownerDriver');

        if (search) {
            queryBuilder.where(
                '(vehicle.licensePlate ILIKE :search OR vehicle.make ILIKE :search OR vehicle.model ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        if (vehicleTypeId) {
            queryBuilder.andWhere('vehicle.vehicleTypeId = :vehicleTypeId', { vehicleTypeId });
        }

        if (status) {
            queryBuilder.andWhere('vehicle.status = :status', { status });
        }

        if (ownerDriverId) {
            queryBuilder.andWhere('vehicle.ownerDriverId = :ownerDriverId', { ownerDriverId });
        }

        if (photosVerified !== undefined) {
            queryBuilder.andWhere('vehicle.photosVerified = :photosVerified', { photosVerified });
        }

        const total = await queryBuilder.getCount();
        const data = await queryBuilder
            .orderBy(`vehicle.${sortBy}`, sortOrder)
            .skip(skip)
            .take(limit)
            .getMany();

        const totalPages = Math.ceil(total / limit);

        return {
            data: data.map((vehicle) => this.mapVehicleToResponse(vehicle)),
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findVehicleById(id: string): Promise<VehicleResponseDto> {
        const vehicle = await this.vehicleRepository.findOne({
            where: { id },
            relations: ['vehicleType', 'ownerDriver'],
        });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }

        return this.mapVehicleToResponse(vehicle);
    }

    async updateVehicle(
        id: string,
        updateVehicleDto: UpdateVehicleDto,
    ): Promise<VehicleUpdatedResponseDto> {
        const vehicle = await this.vehicleRepository.findOne({
            where: { id },
        });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }

        if (
            updateVehicleDto.licensePlate &&
            updateVehicleDto.licensePlate !== vehicle.licensePlate
        ) {
            const existingVehicle = await this.vehicleRepository.findOne({
                where: { licensePlate: updateVehicleDto.licensePlate },
            });

            if (existingVehicle) {
                throw new ConflictException('Vehicle with this license plate already exists');
            }
        }

        if (updateVehicleDto.vehicleTypeId) {
            const vehicleType = await this.vehicleTypeRepository.findOne({
                where: { id: updateVehicleDto.vehicleTypeId },
            });

            if (!vehicleType) {
                throw new NotFoundException('Vehicle type not found');
            }
        }

        if (updateVehicleDto.ownerDriverId) {
            const driver = await this.driverRepository.findOne({
                where: { id: updateVehicleDto.ownerDriverId },
            });

            if (!driver) {
                throw new NotFoundException('Owner driver not found');
            }
        }

        Object.assign(vehicle, updateVehicleDto);
        const updatedVehicle = await this.vehicleRepository.save(vehicle);

        const vehicleWithRelations = await this.vehicleRepository.findOne({
            where: { id: updatedVehicle.id },
            relations: ['vehicleType', 'ownerDriver'],
        });

        await this.cacheManager.del(`vehicle:${id}`);
        await this.cacheManager.del('vehicles:list');

        return {
            message: 'Vehicle updated successfully',
            vehicle: this.mapVehicleToResponse(vehicleWithRelations),
        };
    }

    async deleteVehicle(id: string): Promise<void> {
        const vehicle = await this.vehicleRepository.findOne({
            where: { id },
        });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }

        await this.vehicleRepository.remove(vehicle);

        await this.cacheManager.del(`vehicle:${id}`);
        await this.cacheManager.del('vehicles:list');
    }

    async bulkUpdateVehicleStatus(
        bulkUpdateDto: BulkUpdateVehicleStatusDto,
    ): Promise<BulkUpdateResponseDto> {
        try {
            const { vehicleIds, status } = bulkUpdateDto;

            const vehicles = await this.vehicleRepository.find({
                where: { id: In(vehicleIds) },
            });

            if (vehicles.length !== vehicleIds.length) {
                throw new BadRequestException('Some vehicle IDs not found');
            }

            const updatePromises = vehicles.map((vehicle) => {
                vehicle.status = status;
                return this.vehicleRepository.save(vehicle);
            });

            const updatedVehicles = await Promise.all(updatePromises);

            return {
                updatedCount: updatedVehicles.length,
                updatedIds: updatedVehicles.map((v) => v.id),
                failedIds: [],
            };
        } catch (error) {
            throw error;
        }
    }

    async updateVehiclePhotoVerification(
        verificationDto: VehiclePhotoVerificationDto,
    ): Promise<VehiclePhotoVerificationResponseDto> {
        const vehicle = await this.vehicleRepository.findOne({
            where: { id: verificationDto.vehicleId },
        });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }

        vehicle.photosVerified = verificationDto.photosVerified;
        vehicle.lastPhotoUpdate = new Date();

        const updatedVehicle = await this.vehicleRepository.save(vehicle);

        return {
            vehicleId: updatedVehicle.id,
            photosVerified: updatedVehicle.photosVerified,
            lastPhotoUpdate: updatedVehicle.lastPhotoUpdate,
            updatedAt: updatedVehicle.updatedAt,
        };
    }

    async getVehicleStatistics(): Promise<VehicleStatisticsDto> {
        const totalVehicles = await this.vehicleRepository.count();
        const activeVehicles = await this.vehicleRepository.count({
            where: { status: 'active' },
        });
        const inactiveVehicles = await this.vehicleRepository.count({
            where: { status: 'inactive' },
        });
        const verifiedPhotos = await this.vehicleRepository.count({
            where: { photosVerified: true },
        });

        const now = new Date();
        const expiredInsurance = await this.vehicleRepository.count({
            where: { insuranceExpiry: Between(new Date(0), now) },
        });

        const expiredInspection = await this.vehicleRepository.count({
            where: { inspectionExpiry: Between(new Date(0), now) },
        });

        const vehiclesByType = await this.vehicleRepository
            .createQueryBuilder('vehicle')
            .leftJoin('vehicle.vehicleType', 'vehicleType')
            .select('vehicleType.typeName', 'typeName')
            .addSelect('COUNT(vehicle.id)', 'count')
            .groupBy('vehicleType.typeName')
            .getRawMany();

        const byType: Record<string, number> = {};
        vehiclesByType.forEach((item) => {
            byType[item.typeName] = parseInt(item.count);
        });

        const vehiclesByStatus = await this.vehicleRepository
            .createQueryBuilder('vehicle')
            .select('vehicle.status', 'status')
            .addSelect('COUNT(vehicle.id)', 'count')
            .groupBy('vehicle.status')
            .getRawMany();

        const byStatus: Record<string, number> = {};
        vehiclesByStatus.forEach((item) => {
            byStatus[item.status] = parseInt(item.count);
        });

        return {
            totalVehicles,
            activeVehicles,
            inactiveVehicles,
            verifiedPhotos,
            expiredInsurance,
            expiredInspection,
            byType,
            byStatus,
        };
    }

    // Helper methods
    private mapVehicleTypeToResponse(vehicleType: VehicleType): VehicleTypeResponseDto {
        return {
            id: vehicleType.id,
            typeName: vehicleType.typeName,
            description: vehicleType.description,
            maxPassengers: vehicleType.maxPassengers,
            requiresHelmet: vehicleType.requiresHelmet,
            createdAt: vehicleType.createdAt,
            updatedAt: vehicleType.updatedAt,
        };
    }

    private mapVehicleToResponse(vehicle: Vehicle): VehicleResponseDto {
        return {
            id: vehicle.id,
            vehicleTypeId: vehicle.vehicleTypeId,
            licensePlate: vehicle.licensePlate,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            color: vehicle.color,
            engineCapacity: vehicle.engineCapacity,
            insuranceNumber: vehicle.insuranceNumber,
            insuranceExpiry: vehicle.insuranceExpiry,
            inspectionExpiry: vehicle.inspectionExpiry,
            ownerDriverId: vehicle.ownerDriverId,
            registrationDate: vehicle.registrationDate,
            status: vehicle.status,
            photosVerified: vehicle.photosVerified,
            lastPhotoUpdate: vehicle.lastPhotoUpdate,
            createdAt: vehicle.createdAt,
            updatedAt: vehicle.updatedAt,
            vehicleType: vehicle.vehicleType
                ? this.mapVehicleTypeToResponse(vehicle.vehicleType)
                : undefined,
            ownerDriver: vehicle.ownerDriver || undefined,
        };
    }
}
