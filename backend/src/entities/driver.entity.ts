import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { City } from './city.entity';
import { DocumentPhoto } from './document-photo.entity';
import { Trip } from './trip.entity';
import { DriverTaxAccount } from './driver-tax-account.entity';
import { DriverRating } from './driver-rating.entity';
import { Vehicle } from './vehicle.entity';
import { DriverStatusEnum } from 'src/common/enum/status.enum';

@Entity('drivers')
export class Driver extends BaseEntity {
    @Column({ type: 'varchar', length: 50, unique: true })
    licenseNumber: string;

    @Column({ type: 'varchar', length: 100 })
    firstName: string;

    @Column({ type: 'varchar', length: 100 })
    lastName: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    phoneNumber: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    cniNumber: string; // Cameroon National ID

    @Column({ type: 'date', nullable: true })
    birthDate: Date;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ type: 'uuid', nullable: true })
    cityId: string;

    @Column({ type: 'date', nullable: true })
    driverLicenseExpiry: Date;

    @Column({ type: 'date', nullable: true })
    healthCertificateExpiry: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    registrationDate: Date;

    @Column({ type: 'enum', enum: DriverStatusEnum, default: DriverStatusEnum.ACTIVE })
    status: string;

    @Column({ type: 'boolean', default: false })
    photosVerified: boolean;

    @Column({ type: 'timestamp', nullable: true })
    lastPhotoUpdate: Date;

    // Relationships
    @ManyToOne(() => City, (city) => city.drivers)
    @JoinColumn({ name: 'cityId' })
    city: City;

    @OneToMany(() => Vehicle, (vehicle) => vehicle.ownerDriver)
    ownedVehicles: Vehicle[];

    @OneToMany(() => DocumentPhoto, (photo) => photo.driver)
    photos: DocumentPhoto[];

    @OneToMany(() => Trip, (trip) => trip.driver)
    trips: Trip[];

    @OneToMany(() => DriverTaxAccount, (account) => account.driver)
    taxAccounts: DriverTaxAccount[];

    @OneToMany(() => DriverRating, (rating) => rating.driver)
    ratings: DriverRating[];
}
