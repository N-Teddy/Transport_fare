import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';
import { ActionEnum } from 'src/common/enum/global.enum';

@Entity('audit_log')
export class AuditLog extends BaseEntity {
    @Column({ type: 'varchar', length: 100, nullable: true })
    tableName: string;

    @Column({ type: 'uuid', nullable: true })
    recordId: string;

    @Column({ type: 'enum', enum: ActionEnum })
    action: string;

    @Column({ type: 'jsonb', nullable: true })
    oldValues: any;

    @Column({ type: 'jsonb', nullable: true })
    newValues: any;

    @Column({ type: 'uuid', nullable: true })
    changedBy: string; // User ID who made the change

    @Column({ type: 'text', nullable: true })
    changeReason: string;

    @Column({ type: 'inet', nullable: true })
    ipAddress: string;

    @Column({ type: 'text', nullable: true })
    userAgent: string;

    // Relationships
    @ManyToOne(() => User, (user) => user.auditLogs)
    @JoinColumn({ name: 'changedBy' })
    changedByUser: User;
}
