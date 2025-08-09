import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { FareRate } from './fare-rates.entity';
import { Vehicle } from './vehicle.entity';
import { VehicleTypeEnum } from 'src/common/enum/global.enum';

@Entity('vehicle_types')
export class VehicleType extends BaseEntity {
    @Column({ type: 'enum', enum: VehicleTypeEnum, unique: true })
    typeName: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'int', nullable: true })
    maxPassengers: number;

    @Column({ type: 'boolean', default: false })
    requiresHelmet: boolean;

    // Relationships
    @OneToMany(() => Vehicle, (vehicle) => vehicle.vehicleType)
    vehicles: Vehicle[];

    @OneToMany(() => FareRate, (rate) => rate.vehicleType)
    fareRates: FareRate[];
}
