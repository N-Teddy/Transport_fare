import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Trip } from './trip.entity';
import { MobilePaymentStatusEnum } from 'src/common/enum/status.enum';
import { MobilePaymentOperatorEnum } from 'src/common/enum/global.enum';

@Entity('mobile_payments')
export class MobilePayment extends BaseEntity {
    @Column({ type: 'uuid' })
    tripId: string;

    @Column({ type: 'enum', enum: MobilePaymentOperatorEnum })
    operator: string;

    @Column({ type: 'uuid', unique: true })
    transactionId: string;

    @Column({ type: 'varchar', length: 20 })
    payerPhone: string;

    @Column({ type: 'int' })
    amount: number;

    @Column({ type: 'varchar', length: 3, default: 'XAF' })
    currency: string;

    @Column({
        type: 'enum',
        enum: MobilePaymentStatusEnum,
        default: MobilePaymentStatusEnum.PENDING,
    })
    status: string;

    @Column({ type: 'jsonb', nullable: true })
    operatorResponse: any; // Full API response from MTN/Orange

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;

    // Relationships
    @ManyToOne(() => Trip, (trip) => trip.mobilePayments)
    @JoinColumn({ name: 'tripId', referencedColumnName: 'id' })
    trip: Trip;
}
