import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Trip } from './trip.entity';
import { BaseEntity } from './base.entity';

@Entity('gps_tracking_log')
@Index(['tripId', 'timestamp'])
export class GpsTrackingLog extends BaseEntity {
    @Column({ type: 'uuid' })
    tripId: string;

    @Column({ type: 'decimal', precision: 10, scale: 8 })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8 })
    longitude: number;

    @Column({ type: 'int', nullable: true })
    speed: number; // km/h

    @Column({ type: 'int', nullable: true })
    heading: number; // degrees

    @Column({ type: 'int', nullable: true })
    accuracy: number; // meters

    @Column({ type: 'timestamp' })
    timestamp: Date;

    // Relationships
    @ManyToOne(() => Trip, (trip) => trip.gpsLogs)
    @JoinColumn({ name: 'tripId', referencedColumnName: 'id' })
    trip: Trip;
}
