import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Region } from './region.entity';
import { DocumentPhoto } from './document-photo.entity';
import { FareRate } from './fare-rates.entity';
import { SystemSetting } from './system-setting.entity';
import { AuditLog } from './audit-log.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { RegionalFareMultiplier } from './regional-fare-rates.entity';
import { UserRoleEnum } from 'src/common/enum/global.enum';

@Entity('users')
@Index(['username'])
@Index(['email'])
@Index(['role', 'regionId'])
export class User extends BaseEntity {
    @Column({ type: 'varchar', length: 100, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 150, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    passwordHash: string; // bcrypt hash

    @Column({ type: 'varchar', length: 100 })
    firstName: string;

    @Column({ type: 'varchar', length: 100 })
    lastName: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string;

    @Column({ type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.VIEWER })
    role: string;

    @Column({ type: 'uuid', nullable: true })
    regionId: string; // Which region they can access (NULL = all regions)

    @Column({ type: 'boolean', default: true })
    isActive: boolean; // Whether the user account is active

    @Column({ type: 'uuid', nullable: true })
    createdBy: string; // Who created this user account

    // Relationships
    @ManyToOne(() => Region, (region) => region.users)
    @JoinColumn({ name: 'regionId' })
    region: Region;

    @ManyToOne(() => User, (user) => user.createdUsers)
    @JoinColumn({ name: 'createdBy' })
    creator: User;

    @OneToMany(() => User, (user) => user.creator)
    createdUsers: User[];

    @OneToMany(() => DocumentPhoto, (photo) => photo.verifiedByUser)
    verifiedPhotos: DocumentPhoto[];

    @OneToMany(() => DocumentPhoto, (photo) => photo.uploadedByUser)
    uploadedPhotos: DocumentPhoto[];

    @OneToMany(() => FareRate, (rate) => rate.createdByUser)
    createdFareRates: FareRate[];

    @OneToMany(() => RegionalFareMultiplier, (multiplier) => multiplier.createdByUser)
    createdFareMultipliers: RegionalFareMultiplier[];

    @OneToMany(() => SystemSetting, (setting) => setting.updatedByUser)
    updatedSettings: SystemSetting[];

    @OneToMany(() => AuditLog, (log) => log.changedByUser)
    auditLogs: AuditLog[];

    @OneToMany(() => PasswordResetToken, (token) => token.user)
    passwordResetTokens: PasswordResetToken[];
}
