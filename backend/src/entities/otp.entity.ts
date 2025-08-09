import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('otps')
export class Otp extends BaseEntity {
    @Column({ type: 'varchar', length: 20 })
    phoneNumber: string;

    @Column({ type: 'varchar', length: 6 })
    code: string;

    @Column({ type: 'timestamp' })
    expiresAt: Date;
}
