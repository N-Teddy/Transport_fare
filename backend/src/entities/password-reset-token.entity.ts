import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken extends BaseEntity {
    @Column({ type: 'uuid', nullable: true })
    userId: string;

    @Column({ type: 'varchar', unique: true, nullable: true })
    token: string;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ type: 'boolean', default: false })
    used: boolean;

    // Relationships
    @ManyToOne(() => User, (user) => user.passwordResetTokens)
    @JoinColumn({ name: 'userId' })
    user: User;
}
