import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('photo_requirements')
export class PhotoRequirement extends BaseEntity {
    @Column({ type: 'varchar', length: 50, unique: true })
    documentType: string;

    @Column({ type: 'boolean', default: true })
    isRequired: boolean;

    @Column({ type: 'text', nullable: true })
    description: string;
}
