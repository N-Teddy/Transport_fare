import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Driver } from './driver.entity';
import { BaseEntity } from './base.entity';
import { TaxPeriodEnum } from 'src/common/enum/global.enum';
import { TaxPaymentStatusEnum } from 'src/common/enum/status.enum';

@Entity('driver_tax_accounts')
export class DriverTaxAccount extends BaseEntity {
    @Column({ type: 'uuid' })
    driverId: string;

    @Column({ type: 'enum', enum: TaxPeriodEnum })
    taxPeriod: string;

    @Column({ type: 'date' })
    periodStart: Date;

    @Column({ type: 'date' })
    periodEnd: Date;

    @Column({ type: 'int', default: 0 })
    totalTrips: number;

    @Column({ type: 'int', default: 0 })
    totalRevenue: number; // Total fares collected

    @Column({ type: 'decimal', precision: 5, scale: 4 })
    taxRate: number; // e.g., 0.05 for 5%

    @Column({ type: 'int', default: 0 })
    taxOwed: number;

    @Column({ type: 'int', default: 0 })
    taxPaid: number;

    @Column({ type: 'date' })
    paymentDueDate: Date;

    @Column({ type: 'enum', enum: TaxPaymentStatusEnum, default: TaxPaymentStatusEnum.PENDING })
    status: string;

    // Relationships
    @ManyToOne(() => Driver, (driver) => driver.taxAccounts)
    @JoinColumn({ name: 'driverId' })
    driver: Driver;
}
