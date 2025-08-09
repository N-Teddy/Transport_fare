import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from '../../entities/trip.entity';
import { GpsTrackingLog } from '../../entities/gps-tracking-log.entity';
import { CreateTripDto, EndTripDto, AddGpsLogDto, AddGpsLogsDto } from '../../dto/request/trip.dto';
import { TripResponseDto, GpsLogResponseDto } from '../../dto/response/trip.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { EXCHANGE_NAMES, ROUTING_KEYS } from '../../config/queue.config';
import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TripPaymentStatusEnum, TripSyncStatusEnum } from 'src/common/enum/status.enum';

@Injectable()
export class TripService {
    constructor(
        @InjectRepository(Trip)
        private readonly tripRepo: Repository<Trip>,
        @InjectRepository(GpsTrackingLog)
        private readonly gpsRepo: Repository<GpsTrackingLog>,
        private readonly amqpConnection: AmqpConnection,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async createTrip(dto: CreateTripDto): Promise<TripResponseDto> {
        // TODO: Validate driver, vehicle, meter existence if needed
        const trip = this.tripRepo.create({
            ...dto,
            paymentStatus: TripPaymentStatusEnum.PENDING,
            syncStatus: TripSyncStatusEnum.PENDING,
            totalFare: 0,
        });
        await this.tripRepo.save(trip);
        // Publish trip.start event
        await this.amqpConnection.publish(EXCHANGE_NAMES.TRIP, ROUTING_KEYS.TRIP.START, {
            tripId: trip.id,
            ...dto,
        });
        await this.cacheManager.del('trips:list');
        return trip as unknown as TripResponseDto;
    }

    async endTrip(dto: EndTripDto): Promise<TripResponseDto> {
        const trip = await this.tripRepo.findOne({ where: { id: dto.tripId } });
        if (!trip) throw new NotFoundException('Trip not found');
        Object.assign(trip, {
            endTime: dto.endTime,
            endLatitude: dto.endLatitude,
            endLongitude: dto.endLongitude,
            distanceKm: dto.distanceKm,
            durationMinutes: dto.durationMinutes,
            baseFare: dto.baseFare,
            distanceFare: dto.distanceFare,
            timeFare: dto.timeFare,
            surcharges: dto.surcharges,
            totalFare: dto.totalFare,
            paymentMethod: dto.paymentMethod,
            paymentReference: dto.paymentReference,
            passengerPhone: dto.passengerPhone,
            paymentStatus: TripPaymentStatusEnum.COMPLETED,
            syncStatus: TripSyncStatusEnum.PENDING,
        });
        await this.tripRepo.save(trip);
        // Publish trip.end event
        await this.amqpConnection.publish(EXCHANGE_NAMES.TRIP, ROUTING_KEYS.TRIP.END, {
            tripId: trip.id,
            ...dto,
        });
        await this.cacheManager.del('trips:list');
        return trip as unknown as TripResponseDto;
    }

    // In trip.service.ts

    async getTrips(
        page: number = 1,
        limit: number = 10,
        filters?: {
            driverId?: string;
            vehicleId?: string;
            startDate?: Date;
            endDate?: Date;
            paymentStatus?: string;
            syncStatus?: string;
        },
    ): Promise<{ items: TripResponseDto[]; total: number }> {
        try {
            const parsedPage = Number(page) || 1;
            const parsedLimit = Number(limit) || 10;
            const skip = (parsedPage - 1) * parsedLimit;

            const where: any = {};

            if (filters?.driverId) where.driverId = filters.driverId;
            if (filters?.vehicleId) where.vehicleId = filters.vehicleId;
            if (filters?.paymentStatus) where.paymentStatus = filters.paymentStatus;
            if (filters?.syncStatus) where.syncStatus = filters.syncStatus;

            if (filters?.startDate && filters?.endDate) {
                where.startTime = Between(filters.startDate, filters.endDate);
            } else if (filters?.startDate) {
                where.startTime = MoreThanOrEqual(filters.startDate);
            } else if (filters?.endDate) {
                where.startTime = LessThanOrEqual(filters.endDate);
            }

            const cacheKey = `trips:${JSON.stringify({ page, limit, filters })}`;
            const cached = await this.cacheManager.get(cacheKey);

            if (cached) {
                return cached as { items: TripResponseDto[]; total: number };
            }

            const [trips, total] = await this.tripRepo.findAndCount({
                where,
                order: { startTime: 'DESC' },
                skip,
                take: parsedLimit,
            });

            const result = {
                items: trips as unknown as TripResponseDto[],
                total,
            };

            await this.cacheManager.set(cacheKey, result, 60); // Cache for 60 seconds

            return result;
        } catch (error) {
            throw error;
        }
    }

    async addGpsLog(dto: AddGpsLogDto): Promise<GpsLogResponseDto> {
        // Validate trip exists
        const trip = await this.tripRepo.findOne({ where: { id: dto.tripId } });
        if (!trip) throw new NotFoundException('Trip not found');
        const log = this.gpsRepo.create({ ...dto });
        await this.gpsRepo.save(log);
        // Publish trip.gps event
        await this.amqpConnection.publish(EXCHANGE_NAMES.TRIP, ROUTING_KEYS.TRIP.SYNC, {
            tripId: dto.tripId,
            ...dto,
        });
        await this.cacheManager.del('trips:list');
        return log as unknown as GpsLogResponseDto;
    }

    async addGpsLogs(dto: AddGpsLogsDto): Promise<GpsLogResponseDto[]> {
        if (!dto.logs.length) return [];
        // Validate trip exists
        const trip = await this.tripRepo.findOne({ where: { id: dto.logs[0].tripId } });
        if (!trip) throw new NotFoundException('Trip not found');
        const logs = this.gpsRepo.create(dto.logs);
        await this.gpsRepo.save(logs);
        // Publish trip.gps event (batch)
        await this.amqpConnection.publish(EXCHANGE_NAMES.TRIP, ROUTING_KEYS.TRIP.SYNC, {
            tripId: dto.logs[0].tripId,
            logs: dto.logs,
        });
        await this.cacheManager.del('trips:list');
        return logs as unknown as GpsLogResponseDto[];
    }

    async getTripById(id: string): Promise<TripResponseDto> {
        const trip = await this.tripRepo.findOne({ where: { id } });
        if (!trip) throw new NotFoundException('Trip not found');
        await this.cacheManager.del(`trip:${id}`);
        return trip as unknown as TripResponseDto;
    }

    async getGpsLogsByTripId(tripId: string): Promise<GpsLogResponseDto[]> {
        const logs = await this.gpsRepo.find({ where: { tripId }, order: { timestamp: 'ASC' } });
        return logs as unknown as GpsLogResponseDto[];
    }

    async getTripStats(): Promise<any> {
        // Overall trip statistics
        const totalTrips = await this.tripRepo.count();
        const totalRevenue = await this.tripRepo
            .createQueryBuilder('trip')
            .select('SUM(trip.totalFare)', 'sum')
            .getRawOne();
        return {
            totalTrips,
            totalRevenue: Number(totalRevenue.sum) || 0,
        };
    }

    async getDriverTripStats(driverId: string): Promise<any> {
        // Stats for a specific driver
        const totalTrips = await this.tripRepo.count({ where: { driverId } });
        const totalRevenue = await this.tripRepo
            .createQueryBuilder('trip')
            .select('SUM(trip.totalFare)', 'sum')
            .where('trip.driverId = :driverId', { driverId })
            .getRawOne();
        return {
            totalTrips,
            totalRevenue: Number(totalRevenue.sum) || 0,
        };
    }

    async getVehicleTripStats(vehicleId: string): Promise<any> {
        // Stats for a specific vehicle
        const totalTrips = await this.tripRepo.count({ where: { vehicleId } });
        const totalRevenue = await this.tripRepo
            .createQueryBuilder('trip')
            .select('SUM(trip.totalFare)', 'sum')
            .where('trip.vehicleId = :vehicleId', { vehicleId })
            .getRawOne();
        return {
            totalTrips,
            totalRevenue: Number(totalRevenue.sum) || 0,
        };
    }

    async getDailyTripStats(startDate: string, endDate: string): Promise<any[]> {
        // Trips per day for a period
        const results = await this.tripRepo
            .createQueryBuilder('trip')
            .select('DATE(trip.startTime)', 'date')
            .addSelect('COUNT(*)', 'tripCount')
            .addSelect('SUM(trip.totalFare)', 'totalRevenue')
            .where('trip.startTime >= :startDate', { startDate })
            .andWhere('trip.startTime <= :endDate', { endDate })
            .groupBy('date')
            .orderBy('date', 'ASC')
            .getRawMany();
        return results.map((r) => ({
            date: r.date,
            tripCount: Number(r.tripCount),
            totalRevenue: Number(r.totalRevenue) || 0,
        }));
    }

    async updateTrip(id: string) {
        // ...existing logic
        await this.cacheManager.del(`trip:${id}`);
        await this.cacheManager.del('trips:list');
        // ...existing logic
    }

    async deleteTrip(id: string) {
        // ...existing logic
        await this.cacheManager.del(`trip:${id}`);
        await this.cacheManager.del('trips:list');
        // ...existing logic
    }
}
