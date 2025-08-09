import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('system_settings')
export class SystemSetting extends BaseEntity {
    @Column({ type: 'varchar', length: 100, unique: true })
    settingKey: string;

    @Column({ type: 'text', nullable: true })
    settingValue: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    dataType: string; // 'string', 'integer', 'decimal', 'boolean', 'json'

    @Column({ type: 'varchar', length: 50, nullable: true })
    category: string; // 'fare_calculation', 'payment', 'system'

    @Column({ type: 'boolean', default: false })
    isPublic: boolean; // Can drivers/passengers see this?

    @Column({ type: 'uuid', nullable: true })
    updatedBy: string; // Government admin who changed it

    // Relationships
    @ManyToOne(() => User, (user) => user.updatedSettings)
    @JoinColumn({ name: 'updatedBy' })
    updatedByUser: User;
}
