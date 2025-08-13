import { Injectable, NotFoundException, BadRequestException, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { DocumentPhoto } from 'src/entities/document-photo.entity';
import { User } from 'src/entities/user.entity';
import { Driver } from 'src/entities/driver.entity';
import { Vehicle } from 'src/entities/vehicle.entity';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
    UploadDocumentDto,
    UploadMultipleDocumentsDto,
    ProcessDocumentDto,
    BatchProcessDocumentsDto,
    VerifyDocumentDto,
    BatchVerifyDocumentsDto,
    DocumentQueryDto,
    UpdateDocumentDto,
    DeleteDocumentDto,
    BatchDeleteDocumentsDto,
    UpdateProcessingStatusDto,
    DocumentStatisticsQueryDto,
} from 'src/dto/request/document.dto';
import {
    DocumentResponseDto,
    DocumentListResponseDto,
    UploadResponseDto,
    UploadMultipleResponseDto,
    ProcessingResponseDto,
    BatchProcessingResponseDto,
    VerificationResponseDto,
    BatchVerificationResponseDto,
    DocumentStatisticsDto,
    QueueStatusResponseDto,
    DocumentDeletedResponseDto,
} from 'src/dto/response/document.dto';
import { QUEUE_NAMES, ROUTING_KEYS, DOCUMENT_PRIORITIES } from 'src/config/queue.config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class DocumentPhotoService {
    private readonly logger = new Logger(DocumentPhotoService.name);

    constructor(
        @InjectRepository(DocumentPhoto)
        private documentPhotoRepository: Repository<DocumentPhoto>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Driver)
        private driverRepository: Repository<Driver>,
        @InjectRepository(Vehicle)
        private vehicleRepository: Repository<Vehicle>,
        private readonly amqpConnection: AmqpConnection,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    // File Upload Methods
    async uploadDocument(
        entityType: string,
        entityId: string,
        uploadDto: UploadDocumentDto,
        file: Express.Multer.File,
        uploadedBy: string,
    ): Promise<UploadResponseDto> {
        // Validate entity exists
        await this.validateEntity(entityType, entityId);

        // Generate unique filename
        const fileExtension = path.extname(file.originalname);
        const uniqueFileName = `${uploadDto.documentType}_${entityType}_${entityId}_${uuidv4()}${fileExtension}`;

        // Create upload directory if it doesn't exist
        const uploadDir = path.join(process.env.LOCAL_STORAGE_PATH || './uploads', 'documents');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, uniqueFileName);

        // Save file to disk
        fs.writeFileSync(filePath, file.buffer);

        // Create document record
        const document = this.documentPhotoRepository.create({
            entityType: entityType,
            entityId: entityId,
            documentType: uploadDto.documentType,
            fileName: uniqueFileName,
            filePath: filePath,
            verificationStatus: 'pending',
            metadata: uploadDto.metadata || {},
            uploadedBy: uploadedBy,
        });

        const savedDocument = await this.documentPhotoRepository.save(document);

        // Queue document for processing
        const queueId = await this.queueDocumentForProcessing(savedDocument.id, uploadDto.priority);

        await this.cacheManager.del('documents:list');

        return {
            id: savedDocument.id,
            fileName: uniqueFileName,
            filePath: filePath,
            fileSize: file.size,
            status: 'success',
            queueId,
            createdAt: savedDocument.createdAt,
        };
    }

    async uploadMultipleDocuments(
        uploadDto: UploadMultipleDocumentsDto,
        files: Express.Multer.File[],
        uploadedBy: string,
    ): Promise<UploadMultipleResponseDto> {
        const uploads: UploadResponseDto[] = [];
        const errors: string[] = [];

        // Validate entity exists
        await this.validateEntity(uploadDto.entityType, uploadDto.entityId);

        for (let i = 0; i < files.length; i++) {
            try {
                const file = files[i];
                const documentDto = uploadDto.documents[i];

                const uploadResult = await this.uploadDocument(
                    uploadDto.entityType,
                    uploadDto.entityId,
                    documentDto,
                    file,
                    uploadedBy,
                );

                uploads.push(uploadResult);
            } catch (error) {
                this.logger.error(`Failed to upload document ${i}: ${error.message}`);
                errors.push(`Document ${i + 1}: ${error.message}`);
            }
        }

        await this.cacheManager.del('documents:list');

        return {
            uploads,
            successCount: uploads.length,
            failureCount: errors.length,
            errors,
        };
    }

    // Document Processing Methods
    async processDocument(processDto: ProcessDocumentDto): Promise<ProcessingResponseDto> {
        const document = await this.documentPhotoRepository.findOne({
            where: { id: processDto.documentId },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        // Queue document for processing
        const queueId = await this.queueDocumentForProcessing(
            document.id,
            DOCUMENT_PRIORITIES.MEDIUM,
            processDto.processingOptions,
        );

        return {
            documentId: document.id,
            status: 'queued',
            queueId,
            estimatedTime: 30, // 30 seconds estimated
            timestamp: new Date(),
        };
    }

    async batchProcessDocuments(
        batchDto: BatchProcessDocumentsDto,
    ): Promise<BatchProcessingResponseDto> {
        const processing: ProcessingResponseDto[] = [];
        const errors: string[] = [];

        for (const documentId of batchDto.documentIds) {
            try {
                const processResult = await this.processDocument({
                    documentId,
                    processingOptions: batchDto.processingOptions,
                });
                processing.push(processResult);
            } catch (error) {
                this.logger.error(
                    `Failed to queue document ${documentId} for processing: ${error.message}`,
                );
                errors.push(`Document ${documentId}: ${error.message}`);
            }
        }

        await this.cacheManager.del('documents:list');

        return {
            processing,
            queuedCount: processing.length,
            errorCount: errors.length,
            errors,
        };
    }

    async updateProcessingStatus(updateDto: UpdateProcessingStatusDto): Promise<UpdateResult> {
        const document = await this.documentPhotoRepository.findOne({
            where: { id: updateDto.documentId },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        // Update processing metadata
        const processingMetadata = {
            ...document.processingMetadata,
            status: updateDto.status,
            progress: updateDto.progress,
            result: updateDto.result,
            ...updateDto.metadata,
            lastUpdated: new Date().toISOString(),
        };

        return await this.documentPhotoRepository.update(document.id, {
            processingMetadata: processingMetadata as any,
        });
    }

    // Document Verification Methods
    async verifyDocument(
        verifyDto: VerifyDocumentDto,
        verifiedBy: string,
    ): Promise<VerificationResponseDto> {
        const document = await this.documentPhotoRepository.findOne({
            where: { id: verifyDto.documentId },
            relations: ['verifiedByUser'],
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        const updateData: any = {
            verificationStatus: verifyDto.verificationStatus,
            verifiedBy: verifiedBy,
            verifiedAt: new Date(),
        };

        if (verifyDto.comments) {
            updateData.verificationComments = verifyDto.comments;
        }

        if (verifyDto.verificationStatus === 'rejected' && verifyDto.rejectionReason) {
            updateData.rejectionReason = verifyDto.rejectionReason;
        }

        if (verifyDto.metadata) {
            updateData.metadata = {
                ...document.metadata,
                ...verifyDto.metadata,
            };
        }

        await this.documentPhotoRepository.update(document.id, updateData);

        // Publish verification event to queue
        await this.publishVerificationEvent(document.id, verifyDto.verificationStatus);

        const updatedDocument = await this.documentPhotoRepository.findOne({
            where: { id: document.id },
            relations: ['verifiedByUser'],
        });

        await this.cacheManager.del('documents:list');

        return {
            documentId: updatedDocument.id,
            verificationStatus: updatedDocument.verificationStatus,
            comments: updatedDocument.verificationComments,
            rejectionReason: updatedDocument.rejectionReason,
            metadata: updatedDocument.metadata,
            verifiedAt: updatedDocument.verifiedAt,
            verifiedByUser: updatedDocument.verifiedByUser,
        };
    }

    async batchVerifyDocuments(
        batchDto: BatchVerifyDocumentsDto,
        verifiedBy: string,
    ): Promise<BatchVerificationResponseDto> {
        const verifications: VerificationResponseDto[] = [];
        const errors: string[] = [];

        for (const verification of batchDto.verifications) {
            try {
                const verifyResult = await this.verifyDocument(verification, verifiedBy);
                verifications.push(verifyResult);
            } catch (error) {
                this.logger.error(
                    `Failed to verify document ${verification.documentId}: ${error.message}`,
                );
                errors.push(`Document ${verification.documentId}: ${error.message}`);
            }
        }

        await this.cacheManager.del('documents:list');

        return {
            verifications,
            successCount: verifications.length,
            failureCount: errors.length,
            errors,
        };
    }

    // Document Query Methods
    async findAllDocuments(query: DocumentQueryDto): Promise<DocumentListResponseDto> {
        const {
            search,
            entityType,
            entityId,
            documentType,
            verificationStatus,
            verifiedFrom,
            verifiedTo,
            uploadedFrom,
            uploadedTo,
            verifiedBy,
            uploadedBy,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'DESC',
        } = query;

        const skip = (page - 1) * limit;
        const queryBuilder = this.documentPhotoRepository
            .createQueryBuilder('document')
            .leftJoinAndSelect('document.verifiedByUser', 'verifiedByUser')
            .leftJoinAndSelect('document.uploadedByUser', 'uploadedByUser');

        // Search filter
        if (search) {
            queryBuilder.where(
                '(document.fileName ILIKE :search OR document.metadata::text ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        // Entity filters
        if (entityType) {
            queryBuilder.andWhere('document.entityType = :entityType', { entityType });
        }

        if (entityId) {
            queryBuilder.andWhere('document.entityId = :entityId', { entityId });
        }

        if (documentType) {
            queryBuilder.andWhere('document.documentType = :documentType', { documentType });
        }

        if (verificationStatus) {
            queryBuilder.andWhere('document.verificationStatus = :verificationStatus', {
                verificationStatus,
            });
        }

        // Date range filters
        if (verifiedFrom) {
            queryBuilder.andWhere('document.verifiedAt >= :verifiedFrom', { verifiedFrom });
        }

        if (verifiedTo) {
            queryBuilder.andWhere('document.verifiedAt <= :verifiedTo', { verifiedTo });
        }

        if (uploadedFrom) {
            queryBuilder.andWhere('document.createdAt >= :uploadedFrom', { uploadedFrom });
        }

        if (uploadedTo) {
            queryBuilder.andWhere('document.createdAt <= :uploadedTo', { uploadedTo });
        }

        // User filters
        if (verifiedBy) {
            queryBuilder.andWhere('document.verifiedBy = :verifiedBy', { verifiedBy });
        }

        if (uploadedBy) {
            queryBuilder.andWhere('document.uploadedBy = :uploadedBy', { uploadedBy });
        }

        const total = await queryBuilder.getCount();
        const data = await queryBuilder
            .orderBy(`document.${sortBy}`, sortOrder)
            .skip(skip)
            .take(limit)
            .getMany();

        const totalPages = Math.ceil(total / limit);

        await this.cacheManager.del('documents:list');

        return {
            data: data.map((doc) => this.mapDocumentToResponse(doc)),
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findDocumentById(id: string): Promise<DocumentResponseDto> {
        const document = await this.documentPhotoRepository.findOne({
            where: { id },
            relations: ['verifiedByUser', 'uploadedByUser'],
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        await this.cacheManager.del('documents:list');

        return this.mapDocumentToResponse(document);
    }

    async downloadDocument(id: string): Promise<any> {
        const document = await this.documentPhotoRepository.findOne({
            where: { id },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        // Check if file exists
        if (!fs.existsSync(document.filePath)) {
            throw new NotFoundException('Document file not found');
        }

        const fileBuffer = fs.readFileSync(document.filePath);
        const mimeType = this.getMimeType(document.fileName);

        return {
            file: fileBuffer,
            fileName: document.fileName,
            mimeType,
            size: fileBuffer.length,
        };
    }

    // Document Update Methods
    async updateDocument(id: string, updateDto: UpdateDocumentDto): Promise<DocumentResponseDto> {
        const document = await this.documentPhotoRepository.findOne({
            where: { id },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        const updateData: any = {};

        if (updateDto.documentType) {
            updateData.documentType = updateDto.documentType;
        }

        if (updateDto.metadata) {
            updateData.metadata = {
                ...document.metadata,
                ...updateDto.metadata,
            };
        }

        if (updateDto.isActive !== undefined) {
            updateData.isActive = updateDto.isActive;
        }

        await this.documentPhotoRepository.update(id, updateData);

        const updatedDocument = await this.documentPhotoRepository.findOne({
            where: { id },
            relations: ['verifiedByUser', 'uploadedByUser'],
        });

        await this.cacheManager.del(`document:${id}`);
        await this.cacheManager.del('documents:list');

        return this.mapDocumentToResponse(updatedDocument);
    }

    // Document Deletion Methods
    async deleteDocument(deleteDto: DeleteDocumentDto): Promise<DocumentDeletedResponseDto> {
        const document = await this.documentPhotoRepository.findOne({
            where: { id: deleteDto.documentId },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        // Delete file from disk if permanent deletion
        if (deleteDto.permanent && document.filePath && fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        // Soft delete or permanent delete from database
        if (deleteDto.permanent) {
            await this.documentPhotoRepository.remove(document);
        } else {
            await this.documentPhotoRepository.update(document.id, {
                isActive: false,
                metadata: {
                    ...document.metadata,
                    deletedAt: new Date().toISOString(),
                    deletionReason: deleteDto.reason || '',
                } as any,
            });
        }

        await this.cacheManager.del(`document:${document.id}`);
        await this.cacheManager.del('documents:list');

        return {
            id: document.id,
            status: 'success',
            deletedAt: new Date(),
        };
    }

    async batchDeleteDocuments(
        batchDto: BatchDeleteDocumentsDto,
    ): Promise<DocumentDeletedResponseDto[]> {
        const results: DocumentDeletedResponseDto[] = [];

        for (const documentId of batchDto.documentIds) {
            try {
                const deleteResult = await this.deleteDocument({
                    documentId,
                    reason: batchDto.reason,
                    permanent: batchDto.permanent,
                });
                results.push(deleteResult);
            } catch (error) {
                this.logger.error(`Failed to delete document ${documentId}: ${error.message}`);
                results.push({
                    id: documentId,
                    status: 'failed',
                    deletedAt: new Date(),
                });
            }
        }

        await this.cacheManager.del('documents:list');

        return results;
    }

    // Statistics Methods
    async getDocumentStatistics(query: DocumentStatisticsQueryDto): Promise<DocumentStatisticsDto> {
        const { entityType, fromDate, toDate } = query;

        const queryBuilder = this.documentPhotoRepository.createQueryBuilder('document');

        if (entityType) {
            queryBuilder.andWhere('document.entityType = :entityType', { entityType });
        }

        if (fromDate) {
            queryBuilder.andWhere('document.createdAt >= :fromDate', { fromDate });
        }

        if (toDate) {
            queryBuilder.andWhere('document.createdAt <= :toDate', { toDate });
        }

        const totalDocuments = await queryBuilder.getCount();
        const pendingDocuments = await queryBuilder
            .andWhere('document.verificationStatus = :status', { status: 'pending' })
            .getCount();
        const approvedDocuments = await queryBuilder
            .andWhere('document.verificationStatus = :status', { status: 'approved' })
            .getCount();
        const rejectedDocuments = await queryBuilder
            .andWhere('document.verificationStatus = :status', { status: 'rejected' })
            .getCount();

        // Documents by type
        const byTypeResult = await queryBuilder
            .select('document.documentType', 'type')
            .addSelect('COUNT(document.id)', 'count')
            .groupBy('document.documentType')
            .getRawMany();

        const byType: Record<string, number> = {};
        byTypeResult.forEach((item) => {
            byType[item.type] = parseInt(item.count);
        });

        // Documents by entity type
        const byEntityTypeResult = await queryBuilder
            .select('document.entityType', 'entityType')
            .addSelect('COUNT(document.id)', 'count')
            .groupBy('document.entityType')
            .getRawMany();

        const byEntityType: Record<string, number> = {};
        byEntityTypeResult.forEach((item) => {
            byEntityType[item.entityType] = parseInt(item.count);
        });

        // Documents by verification status
        const byVerificationStatusResult = await queryBuilder
            .select('document.verificationStatus', 'status')
            .addSelect('COUNT(document.id)', 'count')
            .groupBy('document.verificationStatus')
            .getRawMany();

        const byVerificationStatus: Record<string, number> = {};
        byVerificationStatusResult.forEach((item) => {
            byVerificationStatus[item.status] = parseInt(item.count);
        });

        // Recent activity
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const uploadsLast30Days = await queryBuilder
            .andWhere('document.createdAt >= :date', { date: thirtyDaysAgo })
            .getCount();

        const verificationsLast30Days = await queryBuilder
            .andWhere('document.verifiedAt >= :date', { date: thirtyDaysAgo })
            .getCount();

        await this.cacheManager.del('documents:list');

        return {
            totalDocuments,
            pendingDocuments,
            approvedDocuments,
            rejectedDocuments,
            processingDocuments: 0, // This would need to be tracked separately
            byType,
            byEntityType,
            byVerificationStatus,
            byProcessingStatus: {}, // This would need to be tracked separately
            uploadsLast30Days,
            verificationsLast30Days,
        };
    }

    // Queue Management Methods
    async getQueueStatus(): Promise<QueueStatusResponseDto[]> {
        const queues = [
            QUEUE_NAMES.DOCUMENT_UPLOAD,
            QUEUE_NAMES.DOCUMENT_PROCESS,
            QUEUE_NAMES.DOCUMENT_VERIFICATION,
        ];

        const statuses: QueueStatusResponseDto[] = [];

        for (const queueName of queues) {
            try {
                // This would require RabbitMQ management API or custom implementation
                // For now, returning mock data
                statuses.push({
                    queueName,
                    messageCount: Math.floor(Math.random() * 100),
                    consumerCount: Math.floor(Math.random() * 5) + 1,
                    status: 'active',
                    lastMessageAt: new Date(),
                });
            } catch (error) {
                this.logger.error(`Failed to get queue status for ${queueName}: ${error.message}`);
            }
        }

        return statuses;
    }

    // Private Helper Methods
    private async validateEntity(entityType: string, entityId: string): Promise<void> {
        switch (entityType) {
            case 'driver':
                const driver = await this.driverRepository.findOne({ where: { id: entityId } });
                if (!driver) {
                    throw new NotFoundException('Driver not found');
                }
                break;
            case 'vehicle':
                const vehicle = await this.vehicleRepository.findOne({ where: { id: entityId } });
                if (!vehicle) {
                    throw new NotFoundException('Vehicle not found');
                }
                break;
            case 'user':
                const user = await this.userRepository.findOne({ where: { id: entityId } });
                if (!user) {
                    throw new NotFoundException('User not found');
                }
                break;
            default:
                throw new BadRequestException('Invalid entity type');
        }
    }

    private async queueDocumentForProcessing(
        documentId: string,
        priority: number = DOCUMENT_PRIORITIES.MEDIUM,
        options?: Record<string, any>,
    ): Promise<string> {
        const queueId = uuidv4();
        const message = {
            documentId,
            priority,
            options,
            timestamp: new Date(),
            queueId,
        };

        try {
            await this.amqpConnection.publish(
                'document.exchange',
                ROUTING_KEYS.DOCUMENT.PROCESS,
                message,
                {
                    priority,
                    persistent: true,
                    headers: {
                        'x-message-ttl': 600000, // 10 minutes
                    },
                },
            );

            this.logger.log(`Document ${documentId} queued for processing with ID ${queueId}`);
            return queueId;
        } catch (error) {
            this.logger.error(
                `Failed to queue document ${documentId} for processing: ${error.message}`,
            );
            throw new BadRequestException('Failed to queue document for processing');
        }
    }

    private async publishVerificationEvent(documentId: string, status: string): Promise<void> {
        const message = {
            documentId,
            status,
            timestamp: new Date(),
        };

        try {
            const routingKey =
                status === 'approved'
                    ? ROUTING_KEYS.DOCUMENT.VERIFIED
                    : ROUTING_KEYS.DOCUMENT.REJECTED;

            await this.amqpConnection.publish('document.exchange', routingKey, message, {
                persistent: true,
            });

            this.logger.log(
                `Verification event published for document ${documentId} with status ${status}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to publish verification event for document ${documentId}: ${error.message}`,
            );
        }
    }

    private mapDocumentToResponse(document: DocumentPhoto): DocumentResponseDto {
        return {
            id: document.id,
            entityType: document.entityType,
            entityId: document.entityId,
            documentType: document.documentType,
            fileName: document.fileName,
            filePath: document.filePath,
            fileSize: fs.existsSync(document.filePath) ? fs.statSync(document.filePath).size : 0,
            mimeType: this.getMimeType(document.fileName),
            verificationStatus: document.verificationStatus,
            verifiedBy: document.verifiedBy,
            verifiedAt: document.verifiedAt,
            verificationComments: document.verificationComments,
            rejectionReason: document.rejectionReason,
            processingStatus: document.processingMetadata?.status,
            processingProgress: document.processingMetadata?.progress,
            processingResult: document.processingMetadata?.result,
            metadata: document.metadata,
            processingMetadata: document.processingMetadata,
            isActive: document.isActive,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
            verifiedByUser: document.verifiedByUser,
            uploadedByUser: document.uploadedByUser,
        };
    }

    private getMimeType(fileName: string): string {
        const ext = path.extname(fileName).toLowerCase();
        const mimeTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }
}
