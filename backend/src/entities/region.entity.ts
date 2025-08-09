import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { City } from './city.entity';
import { User } from './user.entity';
import { RegionalFareMultiplier } from './regional-fare-rates.entity';
import { CameroonRegionCodesEnum, CameroonRegionEnum } from 'src/common/enum/region.enum';

@Entity('regions')
export class Region extends BaseEntity {
    @Column({ type: 'enum', enum: CameroonRegionEnum, unique: true })
    name: string;

    @Column({ type: 'enum', enum: CameroonRegionCodesEnum, unique: true })
    code: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    capitalCity: string;

    // Relationships
    @OneToMany(() => City, (city) => city.region)
    cities: City[];

    @OneToMany(() => User, (user) => user.region)
    users: User[];

    @OneToMany(() => RegionalFareMultiplier, (multiplier) => multiplier.region)
    fareMultipliers: RegionalFareMultiplier[];
}
