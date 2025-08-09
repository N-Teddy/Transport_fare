import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { BaseEntity } from './base.entity';
import { Trip } from './trip.entity';
import { MeterStatusEnum } from 'src/common/enum/status.enum';

@Entity('meters')
export class Meter extends BaseEntity {
    @Column({ type: 'varchar', length: 100, unique: true })
    meterSerial: string;

    @Column({ type: 'uuid', nullable: true })
    vehicleId: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    manufacturer: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    model: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    firmwareVersion: string;

    @Column({ type: 'date', nullable: true })
    installationDate: Date;

    @Column({ type: 'date', nullable: true })
    lastCalibration: Date;

    @Column({ type: 'date', nullable: true })
    nextCalibrationDue: Date;

    @Column({ type: 'enum', enum: MeterStatusEnum, default: MeterStatusEnum.ACTIVE })
    status: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    encryptionKey: string; // For secure data transmission

    // Relationships
    @ManyToOne(() => Vehicle, (vehicle) => vehicle.meters)
    @JoinColumn({ name: 'vehicleId' })
    vehicle: Vehicle;

    @OneToMany(() => Trip, (trip) => trip.meter)
    trips: Trip[];
}
