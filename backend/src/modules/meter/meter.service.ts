import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
    Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull, LessThanOrEqual } from 'typeorm';
import { Meter } from '../../entities/meter.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import {
    CreateMeterDto,
    UpdateMeterDto,
    MeterQueryDto,
    CalibrateMeterDto,
    UpdateMeterStatusDto,
} from '../../dto/request/meter.dto';
import {
    MeterResponseDto,
    MeterListResponseDto,
    MeterStatisticsResponseDto,
    CalibrationResponseDto,
    MeterAssignmentResponseDto,
    MeterStatusUpdateResponseDto,
    MeterSearchResponseDto,
} from '../../dto/response/meter.dto';
import { MeterStatusEnum } from '../../common/enum/status.enum';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class MeterService {
    constructor(
        @InjectRepository(Meter)
        private readonly meterRepository: Repository<Meter>,
        @InjectRepository(Vehicle)
        private readonly vehicleRepository: Repository<Vehicle>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async create(createMeterDto: CreateMeterDto): Promise<MeterResponseDto> {
        // Check if meter serial already exists
        const existingMeter = await this.meterRepository.findOne({
            where: { meterSerial: createMeterDto.meterSerial },
        });

        if (existingMeter) {
            throw new ConflictException('Meter with this serial number already exists');
        }

        // If vehicleId is provided, verify vehicle exists
        if (createMeterDto.vehicleId) {
            const vehicle = await this.vehicleRepository.findOne({
                where: { id: createMeterDto.vehicleId },
            });

            if (!vehicle) {
                throw new NotFoundException('Vehicle not found');
            }

            // Check if vehicle already has a meter assigned
            const existingVehicleMeter = await this.meterRepository.findOne({
                where: { vehicleId: createMeterDto.vehicleId },
            });

            if (existingVehicleMeter) {
                throw new ConflictException('Vehicle already has a meter assigned');
            }
        }

        const meter = this.meterRepository.create({
            ...createMeterDto,
            status: createMeterDto.status || MeterStatusEnum.ACTIVE,
        });

        const savedMeter = await this.meterRepository.save(meter);
        await this.cacheManager.del('meters:list');
        return this.mapToResponseDto(savedMeter);
    }

    async findAll(query: MeterQueryDto): Promise<MeterListResponseDto> {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            vehicleId,
            manufacturer,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
        } = query;

        const queryBuilder = this.meterRepository
            .createQueryBuilder('meter')
            .leftJoinAndSelect('meter.vehicle', 'vehicle');

        // Apply search filter
        if (search) {
            queryBuilder.andWhere(
                '(meter.meterSerial LIKE :search OR meter.manufacturer LIKE :search OR meter.model LIKE :search)',
                { search: `%${search}%` },
            );
        }

        // Apply status filter
        if (status) {
            queryBuilder.andWhere('meter.status = :status', { status });
        }

        // Apply vehicle filter
        if (vehicleId) {
            queryBuilder.andWhere('meter.vehicleId = :vehicleId', { vehicleId });
        }

        // Apply manufacturer filter
        if (manufacturer) {
            queryBuilder.andWhere('meter.manufacturer = :manufacturer', { manufacturer });
        }

        // Apply sorting
        queryBuilder.orderBy(`meter.${sortBy}`, sortOrder as 'ASC' | 'DESC');

        // Apply pagination
        const skip = (page - 1) * limit;
        queryBuilder.skip(skip).take(limit);

        const [meters, total] = await queryBuilder.getManyAndCount();

        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            data: meters.map((meter) => this.mapToResponseDto(meter)),
            total,
            page,
            limit,
            totalPages,
            hasNextPage,
            hasPrevPage,
        };
    }

    async findOne(id: string): Promise<MeterResponseDto> {
        const meter = await this.meterRepository.findOne({
            where: { id },
            relations: ['vehicle'],
        });

        if (!meter) {
            throw new NotFoundException('Meter not found');
        }

        return this.mapToResponseDto(meter);
    }

    async findBySerial(serial: string): Promise<MeterResponseDto> {
        const meter = await this.meterRepository.findOne({
            where: { meterSerial: serial },
            relations: ['vehicle'],
        });

        if (!meter) {
            throw new NotFoundException('Meter not found');
        }

        return this.mapToResponseDto(meter);
    }

    async update(id: string, updateMeterDto: UpdateMeterDto): Promise<MeterResponseDto> {
        const meter = await this.meterRepository.findOne({
            where: { id },
        });

        if (!meter) {
            throw new NotFoundException('Meter not found');
        }

        // Check if meter serial is being updated and if it already exists
        if (updateMeterDto.meterSerial && updateMeterDto.meterSerial !== meter.meterSerial) {
            const existingMeter = await this.meterRepository.findOne({
                where: { meterSerial: updateMeterDto.meterSerial },
            });

            if (existingMeter) {
                throw new ConflictException('Meter with this serial number already exists');
            }
        }

        // If vehicleId is being updated, verify vehicle exists and check assignment
        if (
            updateMeterDto.vehicleId !== undefined &&
            updateMeterDto.vehicleId !== meter.vehicleId
        ) {
            if (updateMeterDto.vehicleId) {
                const vehicle = await this.vehicleRepository.findOne({
                    where: { id: updateMeterDto.vehicleId },
                });

                if (!vehicle) {
                    throw new NotFoundException('Vehicle not found');
                }

                // Check if vehicle already has a meter assigned
                const existingVehicleMeter = await this.meterRepository.findOne({
                    where: { vehicleId: updateMeterDto.vehicleId },
                });

                if (existingVehicleMeter && existingVehicleMeter.id !== id) {
                    throw new ConflictException('Vehicle already has a meter assigned');
                }
            }
        }

        Object.assign(meter, updateMeterDto);
        const updatedMeter = await this.meterRepository.save(meter);
        await this.cacheManager.del(`meter:${id}`);
        await this.cacheManager.del('meters:list');
        return this.mapToResponseDto(updatedMeter);
    }

    async remove(id: string): Promise<void> {
        const meter = await this.meterRepository.findOne({
            where: { id },
        });

        if (!meter) {
            throw new NotFoundException('Meter not found');
        }

        await this.meterRepository.remove(meter);
        await this.cacheManager.del(`meter:${id}`);
        await this.cacheManager.del('meters:list');
    }

    async assignToVehicle(meterId: string, vehicleId: string): Promise<MeterAssignmentResponseDto> {
        const meter = await this.meterRepository.findOne({
            where: { id: meterId },
        });

        if (!meter) {
            throw new NotFoundException('Meter not found');
        }

        const vehicle = await this.vehicleRepository.findOne({
            where: { id: vehicleId },
        });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }

        // Check if meter is already assigned to a vehicle
        if (meter.vehicleId) {
            throw new ConflictException('Meter is already assigned to a vehicle');
        }

        // Check if vehicle already has a meter assigned
        const existingVehicleMeter = await this.meterRepository.findOne({
            where: { vehicleId },
        });

        if (existingVehicleMeter) {
            throw new ConflictException('Vehicle already has a meter assigned');
        }

        meter.vehicleId = vehicleId;
        await this.meterRepository.save(meter);

        return {
            meterId,
            vehicleId,
            assignedAt: new Date(),
            message: 'Meter successfully assigned to vehicle',
        };
    }

    async unassignFromVehicle(meterId: string): Promise<MeterAssignmentResponseDto> {
        const meter = await this.meterRepository.findOne({
            where: { id: meterId },
        });

        if (!meter) {
            throw new NotFoundException('Meter not found');
        }

        if (!meter.vehicleId) {
            throw new BadRequestException('Meter is not assigned to any vehicle');
        }

        const vehicleId = meter.vehicleId;
        meter.vehicleId = null;
        await this.meterRepository.save(meter);

        return {
            meterId,
            vehicleId,
            assignedAt: new Date(),
            message: 'Meter successfully unassigned from vehicle',
        };
    }

    async calibrate(
        meterId: string,
        calibrateDto: CalibrateMeterDto,
    ): Promise<CalibrationResponseDto> {
        const meter = await this.meterRepository.findOne({
            where: { id: meterId },
        });

        if (!meter) {
            throw new NotFoundException('Meter not found');
        }

        const calibrationDate = new Date(calibrateDto.calibrationDate);
        const nextCalibrationDue = new Date(calibrationDate);
        nextCalibrationDue.setFullYear(nextCalibrationDue.getFullYear() + 1); // Annual calibration

        meter.lastCalibration = calibrationDate;
        meter.nextCalibrationDue = nextCalibrationDue;

        await this.meterRepository.save(meter);

        return {
            meterId,
            calibrationDate,
            nextCalibrationDue,
            notes: calibrateDto.notes,
            createdAt: new Date(),
        };
    }

    async updateStatus(
        meterId: string,
        updateStatusDto: UpdateMeterStatusDto,
    ): Promise<MeterStatusUpdateResponseDto> {
        const meter = await this.meterRepository.findOne({
            where: { id: meterId },
        });

        if (!meter) {
            throw new NotFoundException('Meter not found');
        }

        const previousStatus = meter.status;
        meter.status = updateStatusDto.status;

        await this.meterRepository.save(meter);

        return {
            meterId,
            previousStatus,
            newStatus: updateStatusDto.status,
            reason: updateStatusDto.reason,
            updatedAt: new Date(),
            message: 'Meter status updated successfully',
        };
    }

    async getStatistics(): Promise<MeterStatisticsResponseDto> {
        const [
            totalMeters,
            activeMeters,
            maintenanceMeters,
            faultyMeters,
            unassignedMeters,
            calibrationDueSoon,
            metersByManufacturer,
        ] = await Promise.all([
            this.meterRepository.count(),
            this.meterRepository.count({ where: { status: MeterStatusEnum.ACTIVE } }),
            this.meterRepository.count({ where: { status: MeterStatusEnum.MAINTENANCE } }),
            this.meterRepository.count({ where: { status: MeterStatusEnum.FAULTY } }),
            this.meterRepository.count({ where: { vehicleId: IsNull() } }),
            this.meterRepository.count({
                where: {
                    nextCalibrationDue: LessThanOrEqual(
                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    ), // 30 days from now
                },
            }),
            this.meterRepository
                .createQueryBuilder('meter')
                .select('meter.manufacturer', 'manufacturer')
                .addSelect('COUNT(*)', 'count')
                .where('meter.manufacturer IS NOT NULL')
                .groupBy('meter.manufacturer')
                .getRawMany(),
        ]);

        const manufacturerStats = metersByManufacturer.reduce(
            (acc, item) => {
                acc[item.manufacturer] = parseInt(item.count);
                return acc;
            },
            {} as Record<string, number>,
        );

        return {
            totalMeters,
            activeMeters,
            maintenanceMeters,
            faultyMeters,
            unassignedMeters,
            calibrationDueSoon,
            metersByManufacturer: manufacturerStats,
        };
    }

    async search(searchTerm: string): Promise<MeterSearchResponseDto> {
        const meters = await this.meterRepository.find({
            where: [
                { meterSerial: Like(`%${searchTerm}%`) },
                { manufacturer: Like(`%${searchTerm}%`) },
                { model: Like(`%${searchTerm}%`) },
            ],
            relations: ['vehicle'],
        });

        return {
            meters: meters.map((meter) => this.mapToResponseDto(meter)),
            total: meters.length,
            searchTerm,
        };
    }

    async getMetersDueForCalibration(): Promise<MeterResponseDto[]> {
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const meters = await this.meterRepository.find({
            where: {
                nextCalibrationDue: LessThanOrEqual(thirtyDaysFromNow),
            },
            relations: ['vehicle'],
        });

        return meters.map((meter) => this.mapToResponseDto(meter));
    }

    async getUnassignedMeters(): Promise<MeterResponseDto[]> {
        const meters = await this.meterRepository.find({
            where: { vehicleId: IsNull() },
            relations: ['vehicle'],
        });

        return meters.map((meter) => this.mapToResponseDto(meter));
    }

    async getCalibrationDueMeters(days: number = 30): Promise<MeterResponseDto[]> {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + days);

        const meters = await this.meterRepository.find({
            where: {
                nextCalibrationDue: LessThanOrEqual(dueDate),
                status: MeterStatusEnum.ACTIVE,
            },
            relations: ['vehicle'],
        });

        return meters.map((meter) => this.mapToResponseDto(meter));
    }

    async findOneWithVehicle(id: string): Promise<MeterResponseDto> {
        const meter = await this.meterRepository.findOne({
            where: { id },
            relations: ['vehicle'],
        });

        if (!meter) {
            throw new NotFoundException('Meter not found');
        }

        return this.mapToResponseDto(meter);
    }

    async getByManufacturer(manufacturer: string): Promise<MeterResponseDto[]> {
        const meters = await this.meterRepository.find({
            where: { manufacturer },
            relations: ['vehicle'],
        });

        return meters.map((meter) => this.mapToResponseDto(meter));
    }

    async getByStatus(status: string): Promise<MeterResponseDto[]> {
        const meters = await this.meterRepository.find({
            where: { status },
            relations: ['vehicle'],
        });

        return meters.map((meter) => this.mapToResponseDto(meter));
    }

    private mapToResponseDto(meter: Meter): MeterResponseDto {
        return {
            id: meter.id,
            meterSerial: meter.meterSerial,
            vehicleId: meter.vehicleId,
            manufacturer: meter.manufacturer,
            model: meter.model,
            firmwareVersion: meter.firmwareVersion,
            installationDate: meter.installationDate,
            lastCalibration: meter.lastCalibration,
            nextCalibrationDue: meter.nextCalibrationDue,
            status: meter.status,
            encryptionKey: meter.encryptionKey,
            createdAt: meter.createdAt,
            updatedAt: meter.updatedAt,
        };
    }
}
