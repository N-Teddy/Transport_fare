import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Region } from './region.entity';
import { User } from './user.entity';

@Entity('regional_fare_multipliers')
@Index(['regionId', 'isActive'])
@Unique(['regionId', 'isActive'])
export class RegionalFareMultiplier extends BaseEntity {
    @Column({ type: 'uuid' })
    regionId: string;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
    multiplier: number; // Regional price adjustment

    @Column({ type: 'varchar', length: 200, nullable: true })
    reason: string; // 'Higher fuel costs', 'Remote area', 'Economic factors'

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    effectiveFrom: Date;

    @Column({ type: 'timestamp', nullable: true })
    effectiveUntil: Date;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'uuid', nullable: true })
    createdBy: string; // Government official who set the multiplier

    // Relationships
    @ManyToOne(() => Region, (region) => region.fareMultipliers)
    @JoinColumn({ name: 'regionId' })
    region: Region;

    @ManyToOne(() => User, (user) => user.createdFareMultipliers)
    @JoinColumn({ name: 'createdBy' })
    createdByUser: User;
}
