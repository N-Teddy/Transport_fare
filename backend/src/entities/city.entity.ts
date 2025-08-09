import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Region } from './region.entity';
import { Driver } from './driver.entity';
import { CityEnum } from 'src/common/enum/city.enum';

@Entity('cities')
export class City extends BaseEntity {
    @Column({ type: 'uuid' })
    regionId: string;

    @Column({ type: 'enum', enum: CityEnum })
    name: CityEnum;

    @Column({ type: 'boolean', default: false })
    isMajorCity: boolean;

    // Relationships
    @ManyToOne(() => Region, (region) => region.cities)
    @JoinColumn({ name: 'regionId' })
    region: Region;

    @OneToMany(() => Driver, (driver) => driver.city)
    drivers: Driver[];
}
