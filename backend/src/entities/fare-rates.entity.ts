import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { VehicleType } from './vehicle-type.entity';
import { User } from './user.entity';

@Entity('fare_rates')
@Index(['vehicleTypeId', 'isActive'])
@Unique(['vehicleTypeId', 'isActive'])
export class FareRate extends BaseEntity {
    @Column({ type: 'uuid' })
    vehicleTypeId: string;

    @Column({ type: 'int' })
    baseFare: number; // Base fare in CFA Francs

    @Column({ type: 'int' })
    perKmRate: number; // Rate per kilometer

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
    nightMultiplier: number; // Night time multiplier

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    effectiveFrom: Date;

    @Column({ type: 'timestamp', nullable: true })
    effectiveUntil: Date;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'uuid', nullable: true })
    createdBy: string; // Government official who set the rate

    @Column({ type: 'text', nullable: true })
    notes: string; // Additional notes about the rate

    // Relationships
    @ManyToOne(() => VehicleType, (type) => type.fareRates)
    @JoinColumn({ name: 'vehicleTypeId' })
    vehicleType: VehicleType;

    @ManyToOne(() => User, (user) => user.createdFareRates)
    @JoinColumn({ name: 'createdBy' })
    createdByUser: User;
}
