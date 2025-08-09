import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Driver } from './driver.entity';
import { Vehicle } from './vehicle.entity';
import { BaseEntity } from './base.entity';
import { DocumentPhotoEnum } from 'src/common/enum/document-photo.enum';
import { VerificationStatusEnum } from 'src/common/enum/status.enum';

@Entity('document_photos')
@Index(['entityType', 'entityId'])
@Index(['documentType'])
@Index(['verificationStatus'])
export class DocumentPhoto extends BaseEntity {
    @Column({ type: 'varchar', length: 20 })
    entityType: string; // 'driver', 'vehicle'

    @Column({ type: 'uuid' })
    entityId: string; // driver_id or vehicle_id

    @Column({ type: 'enum', enum: DocumentPhotoEnum })
    documentType: string;

    @Column({ type: 'varchar', length: 255 })
    fileName: string;

    @Column({ type: 'varchar', length: 500 })
    filePath: string; // Path to stored file

    @Column({ type: 'enum', enum: VerificationStatusEnum, default: VerificationStatusEnum.PENDING })
    verificationStatus: string;

    @Column({ type: 'uuid', nullable: true })
    verifiedBy: string; // User who verified

    @Column({ type: 'timestamp', nullable: true })
    verifiedAt: Date;

    @Column({ type: 'text', nullable: true })
    verificationComments: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    rejectionReason: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    processingMetadata: Record<string, any>;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'uuid', nullable: true })
    uploadedBy: string; // User who uploaded

    // Relationships
    @ManyToOne(() => User, (user) => user.verifiedPhotos)
    @JoinColumn({ name: 'verifiedBy' })
    verifiedByUser: User;

    @ManyToOne(() => User, (user) => user.uploadedPhotos)
    @JoinColumn({ name: 'uploadedBy' })
    uploadedByUser: User;

    // Polymorphic relationships - you might want to create separate relations based on entityType
    @ManyToOne(() => Driver, (driver) => driver.photos, {
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'entityId' })
    driver: Driver;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.photos, {
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'entityId' })
    vehicle: Vehicle;
}
