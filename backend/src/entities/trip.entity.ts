import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Driver } from './driver.entity';
import { Vehicle } from './vehicle.entity';
import { Meter } from './meter.entity';
import { GpsTrackingLog } from './gps-tracking-log.entity';
import { MobilePayment } from './mobile-payment.entity';
import { DriverRating } from './driver-rating.entity';
import { BaseEntity } from './base.entity';
import { PaymentMethodEnum } from 'src/common/enum/global.enum';
import { TripPaymentStatusEnum, TripSyncStatusEnum } from 'src/common/enum/status.enum';

@Entity('trips')
@Index(['driverId', 'startTime'])
@Index(['vehicleId', 'startTime'])
@Index(['paymentStatus'])
@Index(['syncStatus'])
export class Trip extends BaseEntity {
    @Column({ type: 'uuid' })
    driverId: string;

    @Column({ type: 'uuid' })
    vehicleId: string;

    @Column({ type: 'uuid', nullable: true })
    meterId: string;

    @Column({ type: 'timestamp' })
    startTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    endTime: Date;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    startLatitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    startLongitude: number;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    endLatitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    endLongitude: number;

    @Column({ type: 'decimal', precision: 8, scale: 3, nullable: true })
    distanceKm: number; // Distance in kilometers

    @Column({ type: 'int', nullable: true })
    durationMinutes: number; // Trip duration

    @Column({ type: 'int', nullable: true })
    baseFare: number;

    @Column({ type: 'int', nullable: true })
    distanceFare: number;

    @Column({ type: 'int', nullable: true })
    timeFare: number;

    @Column({ type: 'int', default: 0 })
    surcharges: number; // Peak, night, airport fees

    @Column({ type: 'int' })
    totalFare: number;

    @Column({ type: 'enum', enum: PaymentMethodEnum, default: PaymentMethodEnum.CASH })
    paymentMethod: string;

    @Column({ type: 'enum', enum: TripPaymentStatusEnum, default: TripPaymentStatusEnum.PENDING })
    paymentStatus: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    paymentReference: string; // Mobile money transaction ID

    @Column({ type: 'varchar', length: 20, nullable: true })
    passengerPhone: string; // Optional, for receipt

    @Column({ type: 'varchar', length: 20, nullable: true })
    dataSource: string; // 'meter', 'mobile_app'

    @Column({ type: 'enum', enum: TripSyncStatusEnum, default: TripSyncStatusEnum.PENDING })
    syncStatus: string;

    @Column({ type: 'timestamp', nullable: true })
    syncedAt: Date;

    // Relationships
    @ManyToOne(() => Driver, (driver) => driver.trips)
    @JoinColumn({ name: 'driverId' })
    driver: Driver;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.trips)
    @JoinColumn({ name: 'vehicleId' })
    vehicle: Vehicle;

    @ManyToOne(() => Meter, (meter) => meter.trips)
    @JoinColumn({ name: 'meterId' })
    meter: Meter;

    @OneToMany(() => GpsTrackingLog, (log) => log.trip)
    gpsLogs: GpsTrackingLog[];

    @OneToMany(() => MobilePayment, (payment) => payment.trip)
    mobilePayments: MobilePayment[];

    @OneToMany(() => DriverRating, (rating) => rating.trip)
    ratings: DriverRating[];
}
