import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, Between, LessThan, MoreThan } from 'typeorm';
import { Driver } from '../../entities/driver.entity';
import { DriverRating } from '../../entities/driver-rating.entity';
import { DriverStatusEnum } from '../../common/enum/status.enum';
import {
    CreateDriverDto,
    UpdateDriverDto,
    DriverQueryDto,
    CreateDriverRatingDto,
    UpdateDriverRatingDto,
    DriverRatingQueryDto,
} from '../../dto/request/driver.dto';
import {
    DriverDeletedResponseDto,
    DriverRatingDeletedResponseDto,
    DriverRatingResponseDto,
    DriverRatingStatsResponseDto,
    DriverRatingUpdatedResponseDto,
    DriverResponseDto,
    DriverUpdatedResponseDto,
} from 'src/dto/response/driver.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Vehicle } from 'src/entities/vehicle.entity';
import { VehicleResponseDto, VehicleTypeResponseDto } from 'src/dto/response/vehicle.dto';
import { VehicleType } from 'src/entities/vehicle-type.entity';
import { DocumentPhoto } from 'src/entities/document-photo.entity';
import { DocumentResponseDto } from 'src/dto/response/document.dto';
import { City } from 'src/entities/city.entity';
import { CityResponseDto } from 'src/dto/response/geography.dto';

@Injectable()
export class DriverService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @InjectRepository(Driver)
        private driverRepository: Repository<Driver>,
        @InjectRepository(DriverRating)
        private driverRatingRepository: Repository<DriverRating>,
    ) {}

    // Driver Methods
    async createDriver(createDriverDto: CreateDriverDto) {
        // Check if driver with same license number, phone, or CNI already exists
        const existingDriver = await this.driverRepository.findOne({
            where: [
                { licenseNumber: createDriverDto.licenseNumber },
                { phoneNumber: createDriverDto.phoneNumber },
                { cniNumber: createDriverDto.cniNumber },
            ],
        });

        if (existingDriver) {
            throw new ConflictException(
                'Driver with this license number, phone number, or CNI already exists',
            );
        }

        const driver = this.driverRepository.create({
            ...createDriverDto,
            status: createDriverDto.status || DriverStatusEnum.PENDING,
            photosVerified: createDriverDto.photosVerified || false,
            registrationDate: new Date(),
        });

        const savedDriver = await this.driverRepository.save(driver);
        await this.cacheManager.del('drivers:list');
        return savedDriver;
    }

    async findAllDrivers(queryDto: DriverQueryDto) {
        const {
            page = 1,
            limit = 10,
            licenseNumber,
            firstName,
            lastName,
            phoneNumber,
            cniNumber,
            cityId,
            status,
            photosVerified,
            licenseExpiryStatus,
            healthCertificateExpiryStatus,
        } = queryDto;

        const whereConditions: FindOptionsWhere<Driver> = {};

        if (licenseNumber) {
            whereConditions.licenseNumber = Like(`%${licenseNumber}%`);
        }

        if (firstName) {
            whereConditions.firstName = Like(`%${firstName}%`);
        }

        if (lastName) {
            whereConditions.lastName = Like(`%${lastName}%`);
        }

        if (phoneNumber) {
            whereConditions.phoneNumber = Like(`%${phoneNumber}%`);
        }

        if (cniNumber) {
            whereConditions.cniNumber = Like(`%${cniNumber}%`);
        }

        if (cityId) {
            whereConditions.cityId = cityId;
        }

        if (status) {
            whereConditions.status = status;
        }

        if (photosVerified !== undefined) {
            whereConditions.photosVerified = photosVerified;
        }

        // Handle expiry status filters
        if (licenseExpiryStatus) {
            const now = new Date();
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            switch (licenseExpiryStatus) {
                case 'expired':
                    whereConditions.driverLicenseExpiry = LessThan(now);
                    break;
                case 'expiring_soon':
                    whereConditions.driverLicenseExpiry = Between(now, thirtyDaysFromNow);
                    break;
                case 'valid':
                    whereConditions.driverLicenseExpiry = MoreThan(thirtyDaysFromNow);
                    break;
            }
        }

        if (healthCertificateExpiryStatus) {
            const now = new Date();
            const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

            switch (healthCertificateExpiryStatus) {
                case 'expired':
                    whereConditions.healthCertificateExpiry = LessThan(now);
                    break;
                case 'expiring_soon':
                    whereConditions.healthCertificateExpiry = Between(now, thirtyDaysFromNow);
                    break;
                case 'valid':
                    whereConditions.healthCertificateExpiry = MoreThan(thirtyDaysFromNow);
                    break;
            }
        }

        const skip = (page - 1) * limit;

        const [drivers, total] = await this.driverRepository.findAndCount({
            where: whereConditions,
            skip,
            take: limit,
            order: { firstName: 'ASC', lastName: 'ASC' },
            relations: ['city'],
        });

        const totalPages = Math.ceil(total / limit);
        const driverResponses = await Promise.all(
            drivers.map((driver) => this.mapToDriverResponse(driver)),
        );

        return {
            drivers: driverResponses,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findDriverById(id: string): Promise<DriverResponseDto> {
        const driver = await this.driverRepository.findOne({
            where: { id },
            relations: ['city', 'city.region', 'ownedVehicles'],
        });

        if (!driver) {
            throw new NotFoundException(`Driver with ID ${id} not found`);
        }

        return this.mapToDriverResponse(driver);
    }

    async findDriverByLicenseNumber(licenseNumber: string) {
        const driver = await this.driverRepository.findOne({
            where: { licenseNumber },
            relations: ['city'],
        });

        if (!driver) {
            throw new NotFoundException(`Driver with license number ${licenseNumber} not found`);
        }

        return this.mapToDriverResponse(driver);
    }

    async findDriverByPhoneNumber(phoneNumber: string) {
        const driver = await this.driverRepository.findOne({
            where: { phoneNumber },
            relations: ['city'],
        });

        if (!driver) {
            throw new NotFoundException(`Driver with phone number ${phoneNumber} not found`);
        }

        return this.mapToDriverResponse(driver);
    }

    async updateDriver(
        id: string,
        updateDriverDto: UpdateDriverDto,
    ): Promise<DriverUpdatedResponseDto> {
        const driver = await this.driverRepository.findOne({
            where: { id },
        });

        if (!driver) {
            throw new NotFoundException(`Driver with ID ${id} not found`);
        }

        // Check for conflicts if updating unique fields
        if (
            updateDriverDto.licenseNumber ||
            updateDriverDto.phoneNumber ||
            updateDriverDto.cniNumber
        ) {
            const existingDriver = await this.driverRepository.findOne({
                where: [
                    { licenseNumber: updateDriverDto.licenseNumber || driver.licenseNumber },
                    { phoneNumber: updateDriverDto.phoneNumber || driver.phoneNumber },
                    { cniNumber: updateDriverDto.cniNumber || driver.cniNumber },
                ],
            });

            if (existingDriver && existingDriver.id !== id) {
                throw new ConflictException(
                    'Driver with this license number, phone number, or CNI already exists',
                );
            }
        }

        await this.driverRepository.update(id, updateDriverDto);

        const updatedDriver = await this.driverRepository.findOne({
            where: { id },
            relations: ['city'],
        });

        await this.cacheManager.del(`driver:${id}`);
        await this.cacheManager.del('drivers:list');

        return {
            message: 'Driver updated successfully',
            driver: await this.mapToDriverResponse(updatedDriver),
        };
    }

    async deleteDriver(id: string): Promise<DriverDeletedResponseDto> {
        const driver = await this.driverRepository.findOne({
            where: { id },
            relations: ['trips', 'ownedVehicles', 'taxAccounts'],
        });

        if (!driver) {
            throw new NotFoundException(`Driver with ID ${id} not found`);
        }

        // Check if driver has associated data
        if (driver.trips.length > 0) {
            throw new ConflictException('Cannot delete driver with associated trips');
        }

        if (driver.ownedVehicles.length > 0) {
            throw new ConflictException('Cannot delete driver with owned vehicles');
        }

        if (driver.taxAccounts.length > 0) {
            throw new ConflictException('Cannot delete driver with tax accounts');
        }

        await this.driverRepository.remove(driver);

        await this.cacheManager.del(`driver:${id}`);
        await this.cacheManager.del('drivers:list');

        return {
            message: 'Driver deleted successfully',
            driverId: id,
        };
    }

    async updateDriverStatus(id: string, status: string): Promise<DriverUpdatedResponseDto> {
        const driver = await this.driverRepository.findOne({
            where: { id },
        });

        if (!driver) {
            throw new NotFoundException(`Driver with ID ${id} not found`);
        }

        if (!Object.values(DriverStatusEnum).includes(status)) {
            throw new BadRequestException('Invalid driver status');
        }

        await this.driverRepository.update(id, { status });

        const updatedDriver = await this.driverRepository.findOne({
            where: { id },
            relations: ['city'],
        });

        await this.cacheManager.del(`driver:${id}`);
        await this.cacheManager.del('drivers:list');

        return {
            message: 'Driver status updated successfully',
            driver: await this.mapToDriverResponse(updatedDriver),
        };
    }

    async verifyDriverPhotos(id: string, verified: boolean): Promise<DriverUpdatedResponseDto> {
        const driver = await this.driverRepository.findOne({
            where: { id },
        });

        if (!driver) {
            throw new NotFoundException(`Driver with ID ${id} not found`);
        }

        await this.driverRepository.update(id, {
            photosVerified: verified,
            lastPhotoUpdate: new Date(),
        });

        const updatedDriver = await this.driverRepository.findOne({
            where: { id },
            relations: ['city'],
        });

        await this.cacheManager.del(`driver:${id}`);
        await this.cacheManager.del('drivers:list');

        return {
            message: `Driver photos ${verified ? 'verified' : 'unverified'} successfully`,
            driver: await this.mapToDriverResponse(updatedDriver),
        };
    }

    // Driver Rating Methods
    async createDriverRating(createDriverRatingDto: CreateDriverRatingDto) {
        // Check if rating already exists for this trip
        // const existingRating = await this.driverRatingRepository.findOne({
        //     where: { tripId: createDriverRatingDto.tripId },
        // });

        // if (existingRating) {
        //     throw new ConflictException('Rating already exists for this trip');
        // }

        // Validate driver exists
        const driver = await this.driverRepository.findOne({
            where: { id: createDriverRatingDto.driverId },
        });

        if (!driver) {
            throw new NotFoundException(
                `Driver with ID ${createDriverRatingDto.driverId} not found`,
            );
        }

        const rating = this.driverRatingRepository.create(createDriverRatingDto);
        const savedRating = await this.driverRatingRepository.save(rating);

        return {
            message: 'Driver rating created successfully',
            rating: await this.mapToDriverRatingResponse(savedRating),
        };
    }

    async findAllDriverRatings(queryDto: DriverRatingQueryDto) {
        const {
            page = 1,
            limit = 10,
            driverId,
            // tripId,
            passengerPhone,
            minRating,
            maxRating,
            rating,
        } = queryDto;

        const whereConditions: FindOptionsWhere<DriverRating> = {};

        if (driverId) {
            whereConditions.driverId = driverId;
        }

        // if (tripId) {
        //     whereConditions.tripId = tripId;
        // }

        if (passengerPhone) {
            whereConditions.passengerPhone = Like(`%${passengerPhone}%`);
        }

        if (rating) {
            whereConditions.rating = rating;
        }

        const skip = (page - 1) * limit;

        const [ratings, total] = await this.driverRatingRepository.findAndCount({
            where: whereConditions,
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
            relations: ['driver', 'trip'],
        });

        // Apply min/max rating filter after query if needed
        let filteredRatings = ratings;
        if (minRating || maxRating) {
            filteredRatings = ratings.filter((r) => {
                if (minRating && r.rating < minRating) return false;
                if (maxRating && r.rating > maxRating) return false;
                return true;
            });
        }

        const totalPages = Math.ceil(total / limit);
        const ratingResponses = await Promise.all(
            filteredRatings.map((rating) => this.mapToDriverRatingResponse(rating)),
        );

        return {
            ratings: ratingResponses,
            total: filteredRatings.length,
            page,
            limit,
            totalPages,
        };
    }

    async findDriverRatingById(id: string): Promise<DriverRatingResponseDto> {
        const rating = await this.driverRatingRepository.findOne({
            where: { id },
            relations: ['driver', 'trip'],
        });

        if (!rating) {
            throw new NotFoundException(`Driver rating with ID ${id} not found`);
        }

        return this.mapToDriverRatingResponse(rating);
    }

    async findDriverRatingsByDriverId(driverId: string): Promise<DriverRatingResponseDto[]> {
        const driver = await this.driverRepository.find({
            where: { id: driverId },
        });

        if (!driver) {
            throw new NotFoundException(`Driver with ID ${driverId} not found`);
        }

        const ratings = await this.driverRatingRepository.find({
            where: { driverId },
            relations: ['driver'],
            order: { createdAt: 'DESC' },
        });

        return Promise.all(ratings.map((rating) => this.mapToDriverRatingResponse(rating)));
    }

    async updateDriverRating(
        id: string,
        updateDriverRatingDto: UpdateDriverRatingDto,
    ): Promise<DriverRatingUpdatedResponseDto> {
        const rating = await this.driverRatingRepository.findOne({
            where: { id },
        });

        if (!rating) {
            throw new NotFoundException(`Driver rating with ID ${id} not found`);
        }

        await this.driverRatingRepository.update(id, updateDriverRatingDto as any);

        const updatedRating = await this.driverRatingRepository.findOne({
            where: { id },
            relations: ['driver', 'trip'],
        });

        return {
            message: 'Driver rating updated successfully',
            rating: await this.mapToDriverRatingResponse(updatedRating),
        };
    }

    async deleteDriverRating(id: string): Promise<DriverRatingDeletedResponseDto> {
        const rating = await this.driverRatingRepository.findOne({
            where: { id },
        });

        if (!rating) {
            throw new NotFoundException(`Driver rating with ID ${id} not found`);
        }

        await this.driverRatingRepository.remove(rating);

        return {
            message: 'Driver rating deleted successfully',
            ratingId: id,
        };
    }

    // Statistics Methods
    async getDriverStats() {
        const [totalDrivers, activeDrivers, suspendedDrivers, revokedDrivers] = await Promise.all([
            this.driverRepository.count(),
            this.driverRepository.count({ where: { status: DriverStatusEnum.ACTIVE } }),
            this.driverRepository.count({ where: { status: DriverStatusEnum.SUSPENDED } }),
            this.driverRepository.count({ where: { status: DriverStatusEnum.REVOKED } }),
        ]);

        const [verifiedPhotos, unverifiedPhotos] = await Promise.all([
            this.driverRepository.count({ where: { photosVerified: true } }),
            this.driverRepository.count({ where: { photosVerified: false } }),
        ]);

        // Get drivers with expiring licenses (within 30 days)
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const expiringLicenses = await this.driverRepository.count({
            where: {
                driverLicenseExpiry: Between(new Date(), thirtyDaysFromNow),
            },
        });

        // Get drivers with expired licenses
        const expiredLicenses = await this.driverRepository.count({
            where: {
                driverLicenseExpiry: LessThan(new Date()),
            },
        });

        // Get average rating for all drivers
        const ratingStats = await this.driverRatingRepository
            .createQueryBuilder('rating')
            .select('AVG(rating.rating)', 'averageRating')
            .addSelect('COUNT(rating.id)', 'totalRatings')
            .getRawOne();

        return {
            totalDrivers,
            activeDrivers,
            suspendedDrivers,
            revokedDrivers,
            verifiedPhotos,
            unverifiedPhotos,
            expiringLicenses,
            expiredLicenses,
            averageRating: parseFloat(ratingStats.averageRating) || 0,
            totalRatings: parseInt(ratingStats.totalRatings) || 0,
        };
    }

    async getDriverRatingStats(driverId: string): Promise<DriverRatingStatsResponseDto> {
        const driver = await this.driverRepository.findOne({
            where: { id: driverId },
        });

        if (!driver) {
            throw new NotFoundException(`Driver with ID ${driverId} not found`);
        }

        const ratings = await this.driverRatingRepository.find({
            where: { driverId },
        });

        if (ratings.length === 0) {
            return {
                driverId,
                totalRatings: 0,
                averageRating: 0,
                ratingDistribution: {},
                categoryAverages: {},
            };
        }

        const totalRatings = ratings.length;
        const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

        // Rating distribution
        const ratingDistribution = {};
        for (let i = 1; i <= 5; i++) {
            ratingDistribution[i] = ratings.filter((r) => r.rating === i).length;
        }

        // Category averages
        const categoryAverages = {};
        const categories = [
            'safety',
            'punctuality',
            'vehicle_condition',
            'cleanliness',
            'communication',
        ];

        categories.forEach((category) => {
            const categoryRatings = ratings
                .filter((r) => r.categories && r.categories[category])
                .map((r) => r.categories[category]);

            if (categoryRatings.length > 0) {
                categoryAverages[category] =
                    categoryRatings.reduce((sum, rating) => sum + rating, 0) /
                    categoryRatings.length;
            } else {
                categoryAverages[category] = 0;
            }
        });

        return {
            driverId,
            totalRatings,
            averageRating,
            ratingDistribution,
            categoryAverages,
        };
    }

    // Helper Methods
    private mapToDriverResponse(driver: Driver) {
        return {
            id: driver.id,
            licenseNumber: driver.licenseNumber,
            firstName: driver.firstName,
            lastName: driver.lastName,
            phoneNumber: driver.phoneNumber,
            cniNumber: driver.cniNumber,
            birthDate: driver.birthDate,
            address: driver.address,
            cityId: driver.cityId,
            cityName: driver.city?.name,
            driverLicenseExpiry: driver.driverLicenseExpiry,
            healthCertificateExpiry: driver.healthCertificateExpiry,
            registrationDate: driver.registrationDate,
            status: driver.status,
            photosVerified: driver.photosVerified,
            lastPhotoUpdate: driver.lastPhotoUpdate,
            createdAt: driver.createdAt,
            updatedAt: driver.updatedAt,
            vehicle: driver.ownedVehicles
                ? this.mapVehicleToResponse(driver.ownedVehicles[0])
                : undefined,
            city: driver.city ? this.mapToCityResponse(driver.city) : undefined,
        };
    }

    private mapToCityResponse(city: City): CityResponseDto {
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

    private async mapToDriverRatingResponse(rating: DriverRating) {
        return {
            id: rating.id,
            driverId: rating.driverId,
            driverName: `${rating.driver?.firstName} ${rating.driver?.lastName}`,
            driverLicenseNumber: rating.driver?.licenseNumber,
            passengerPhone: rating.passengerPhone,
            rating: rating.rating,
            comment: rating.comment,
            categories: rating.categories,
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt,
        };
    }
}
