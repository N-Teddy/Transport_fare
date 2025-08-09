import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { VehicleType } from './vehicle-type.entity';
import { Driver } from './driver.entity';
import { DocumentPhoto } from './document-photo.entity';
import { Meter } from './meter.entity';
import { Trip } from './trip.entity';

@Entity('vehicles')
export class Vehicle extends BaseEntity {
    @Column({ type: 'uuid' })
    vehicleTypeId: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    licensePlate: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    make: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    model: string;

    @Column({ type: 'int', nullable: true })
    year: number;

    @Column({ type: 'varchar', length: 30, nullable: true })
    color: string;

    @Column({ type: 'int', nullable: true })
    engineCapacity: number; // For motorcycles

    @Column({ type: 'varchar', length: 100, nullable: true })
    insuranceNumber: string;

    @Column({ type: 'date', nullable: true })
    insuranceExpiry: Date;

    @Column({ type: 'date', nullable: true })
    inspectionExpiry: Date;

    @Column({ type: 'uuid', nullable: true })
    ownerDriverId: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    registrationDate: Date;

    @Column({ type: 'varchar', length: 20, default: 'active' })
    status: string;

    @Column({ type: 'boolean', default: false })
    photosVerified: boolean;

    @Column({ type: 'timestamp', nullable: true })
    lastPhotoUpdate: Date;

    // Relationships
    @ManyToOne(() => VehicleType, (type) => type.vehicles)
    @JoinColumn({ name: 'vehicleTypeId' })
    vehicleType: VehicleType;

    @ManyToOne(() => Driver, (driver) => driver.ownedVehicles)
    @JoinColumn({ name: 'ownerDriverId' })
    ownerDriver: Driver;

    @OneToMany(() => DocumentPhoto, (photo) => photo.vehicle)
    photos: DocumentPhoto[];

    @OneToMany(() => Meter, (meter) => meter.vehicle)
    meters: Meter[];

    @OneToMany(() => Trip, (trip) => trip.vehicle)
    trips: Trip[];
}
