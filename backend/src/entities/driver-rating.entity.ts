import { Check, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Trip } from './trip.entity';
import { Driver } from './driver.entity';
import { BaseEntity } from './base.entity';

@Entity('driver_ratings')
export class DriverRating extends BaseEntity {
    @Column({ type: 'uuid' })
    tripId: string;

    @Column({ type: 'uuid' })
    driverId: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    passengerPhone: string;

    @Column({ type: 'int' })
    @Check('rating >= 1 AND rating <= 5')
    rating: number;

    @Column({ type: 'text', nullable: true })
    comment: string;

    @Column({ type: 'jsonb', nullable: true })
    categories: any; // {"safety": 5, "punctuality": 4, "vehicle_condition": 5}

    // Relationships
    @ManyToOne(() => Trip, (trip) => trip.ratings)
    @JoinColumn({ name: 'tripId', referencedColumnName: 'id' })
    trip: Trip;

    @ManyToOne(() => Driver, (driver) => driver.ratings)
    @JoinColumn({ name: 'driverId' })
    driver: Driver;
}
