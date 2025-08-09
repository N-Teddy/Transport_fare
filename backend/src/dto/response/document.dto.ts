import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentPhotoEnum } from 'src/common/enum/document-photo.enum';
import { VerificationStatusEnum } from 'src/common/enum/status.enum';

// Document Response DTOs
export class DocumentResponseDto {
    @ApiProperty({
        description: 'Document ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Entity type (driver, vehicle, user)',
        example: 'driver',
    })
    entityType: string;

    @ApiProperty({
        description: 'Entity ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    entityId: string;

    @ApiProperty({
        description: 'Document type',
        enum: DocumentPhotoEnum,
        example: 'driver_license',
    })
    documentType: string;

    @ApiProperty({
        description: 'File name',
        example: 'driver_license_12345.jpg',
    })
    fileName: string;

    @ApiProperty({
        description: 'File path',
        example: '/uploads/documents/driver_license_12345.jpg',
    })
    filePath: string;

    @ApiProperty({
        description: 'File size in bytes',
        example: 1024000,
    })
    fileSize: number;

    @ApiProperty({
        description: 'File MIME type',
        example: 'image/jpeg',
    })
    mimeType: string;

    @ApiProperty({
        description: 'Verification status',
        enum: VerificationStatusEnum,
        example: 'pending',
    })
    verificationStatus: string;

    @ApiPropertyOptional({
        description: 'User ID who verified the document',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    verifiedBy?: string;

    @ApiPropertyOptional({
        description: 'Verification timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    verifiedAt?: Date;

    @ApiPropertyOptional({
        description: 'Verification comments',
        example: 'Document verified successfully',
    })
    verificationComments?: string;

    @ApiPropertyOptional({
        description: 'Rejection reason',
        example: 'Document is expired',
    })
    rejectionReason?: string;

    @ApiPropertyOptional({
        description: 'Processing status',
        example: 'completed',
    })
    processingStatus?: string;

    @ApiPropertyOptional({
        description: 'Processing progress (0-100)',
        example: 100,
    })
    processingProgress?: number;

    @ApiPropertyOptional({
        description: 'Processing result',
        example: 'Text extraction completed',
    })
    processingResult?: string;

    @ApiPropertyOptional({
        description: 'Document metadata',
        example: { expiry_date: '2025-12-31', issuing_authority: 'MINTP' },
    })
    metadata?: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Processing metadata',
        example: { extracted_text: 'Sample text', confidence: 0.95 },
    })
    processingMetadata?: Record<string, any>;

    @ApiProperty({
        description: 'Whether document is active',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    updatedAt: Date;

    // Related data
    @ApiPropertyOptional({
        description: 'User who verified the document',
    })
    verifiedByUser?: any;

    @ApiPropertyOptional({
        description: 'User who uploaded the document',
    })
    uploadedByUser?: any;
}

export class DocumentListResponseDto {
    @ApiProperty({
        description: 'Array of documents',
        type: [DocumentResponseDto],
    })
    data: DocumentResponseDto[];

    @ApiProperty({
        description: 'Total number of documents',
        example: 100,
    })
    total: number;

    @ApiProperty({
        description: 'Current page number',
        example: 1,
    })
    page: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
    })
    limit: number;

    @ApiProperty({
        description: 'Total number of pages',
        example: 10,
    })
    totalPages: number;
}

// Upload Response DTOs
export class UploadResponseDto {
    @ApiProperty({
        description: 'Document ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'File name',
        example: 'driver_license_12345.jpg',
    })
    fileName: string;

    @ApiProperty({
        description: 'File path',
        example: '/uploads/documents/driver_license_12345.jpg',
    })
    filePath: string;

    @ApiProperty({
        description: 'File size in bytes',
        example: 1024000,
    })
    fileSize: number;

    @ApiProperty({
        description: 'Upload status',
        example: 'success',
    })
    status: string;

    @ApiProperty({
        description: 'Processing queue ID',
        example: 'queue_12345',
    })
    queueId: string;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;
}

export class UploadMultipleResponseDto {
    @ApiProperty({
        description: 'Array of upload results',
        type: [UploadResponseDto],
    })
    uploads: UploadResponseDto[];

    @ApiProperty({
        description: 'Number of successful uploads',
        example: 5,
    })
    successCount: number;

    @ApiProperty({
        description: 'Number of failed uploads',
        example: 0,
    })
    failureCount: number;

    @ApiProperty({
        description: 'Array of upload errors',
        example: [],
    })
    errors: string[];
}

// Processing Response DTOs
export class ProcessingResponseDto {
    @ApiProperty({
        description: 'Document ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    documentId: string;

    @ApiProperty({
        description: 'Processing status',
        example: 'queued',
    })
    status: string;

    @ApiProperty({
        description: 'Queue ID',
        example: 'queue_12345',
    })
    queueId: string;

    @ApiPropertyOptional({
        description: 'Estimated processing time in seconds',
        example: 30,
    })
    estimatedTime?: number;

    @ApiProperty({
        description: 'Processing timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    timestamp: Date;
}

export class BatchProcessingResponseDto {
    @ApiProperty({
        description: 'Array of processing results',
        type: [ProcessingResponseDto],
    })
    processing: ProcessingResponseDto[];

    @ApiProperty({
        description: 'Number of documents queued',
        example: 5,
    })
    queuedCount: number;

    @ApiProperty({
        description: 'Number of processing errors',
        example: 0,
    })
    errorCount: number;

    @ApiProperty({
        description: 'Array of processing errors',
        example: [],
    })
    errors: string[];
}

// Verification Response DTOs
export class VerificationResponseDto {
    @ApiProperty({
        description: 'Document ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    documentId: string;

    @ApiProperty({
        description: 'Verification status',
        enum: VerificationStatusEnum,
        example: 'approved',
    })
    verificationStatus: string;

    @ApiPropertyOptional({
        description: 'Verification comments',
        example: 'Document verified successfully',
    })
    comments?: string;

    @ApiPropertyOptional({
        description: 'Rejection reason',
        example: 'Document is expired',
    })
    rejectionReason?: string;

    @ApiPropertyOptional({
        description: 'Verification metadata',
        example: { verified_by_system: true, confidence_score: 0.95 },
    })
    metadata?: Record<string, any>;

    @ApiProperty({
        description: 'Verification timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    verifiedAt: Date;

    @ApiPropertyOptional({
        description: 'User who verified the document',
    })
    verifiedByUser?: any;
}

export class BatchVerificationResponseDto {
    @ApiProperty({
        description: 'Array of verification results',
        type: [VerificationResponseDto],
    })
    verifications: VerificationResponseDto[];

    @ApiProperty({
        description: 'Number of successful verifications',
        example: 5,
    })
    successCount: number;

    @ApiProperty({
        description: 'Number of failed verifications',
        example: 0,
    })
    failureCount: number;

    @ApiProperty({
        description: 'Array of verification errors',
        example: [],
    })
    errors: string[];
}

// Statistics Response DTOs
export class DocumentStatisticsDto {
    @ApiProperty({
        description: 'Total number of documents',
        example: 1000,
    })
    totalDocuments: number;

    @ApiProperty({
        description: 'Number of pending documents',
        example: 150,
    })
    pendingDocuments: number;

    @ApiProperty({
        description: 'Number of approved documents',
        example: 750,
    })
    approvedDocuments: number;

    @ApiProperty({
        description: 'Number of rejected documents',
        example: 100,
    })
    rejectedDocuments: number;

    @ApiProperty({
        description: 'Number of documents being processed',
        example: 25,
    })
    processingDocuments: number;

    @ApiProperty({
        description: 'Documents by type',
        example: {
            driver_license: 300,
            vehicle_photo: 400,
            cni: 200,
            insurance_document: 100,
        },
    })
    byType: Record<string, number>;

    @ApiProperty({
        description: 'Documents by entity type',
        example: {
            driver: 600,
            vehicle: 400,
        },
    })
    byEntityType: Record<string, number>;

    @ApiProperty({
        description: 'Documents by verification status',
        example: {
            pending: 150,
            approved: 750,
            rejected: 100,
        },
    })
    byVerificationStatus: Record<string, number>;

    @ApiProperty({
        description: 'Documents by processing status',
        example: {
            queued: 10,
            processing: 15,
            completed: 900,
            failed: 75,
        },
    })
    byProcessingStatus: Record<string, number>;

    @ApiProperty({
        description: 'Uploads in the last 30 days',
        example: 150,
    })
    uploadsLast30Days: number;

    @ApiProperty({
        description: 'Verifications in the last 30 days',
        example: 200,
    })
    verificationsLast30Days: number;
}

export class DocumentTypeStatisticsDto {
    @ApiProperty({
        description: 'Document type',
        example: 'driver_license',
    })
    documentType: string;

    @ApiProperty({
        description: 'Total count',
        example: 300,
    })
    total: number;

    @ApiProperty({
        description: 'Pending count',
        example: 50,
    })
    pending: number;

    @ApiProperty({
        description: 'Approved count',
        example: 200,
    })
    approved: number;

    @ApiProperty({
        description: 'Rejected count',
        example: 50,
    })
    rejected: number;

    @ApiProperty({
        description: 'Average processing time in minutes',
        example: 5.5,
    })
    averageProcessingTime: number;

    @ApiProperty({
        description: 'Verification rate percentage',
        example: 83.33,
    })
    verificationRate: number;
}

// Export Response DTOs
export class ExportResponseDto {
    @ApiProperty({
        description: 'Export ID',
        example: 'export_12345',
    })
    exportId: string;

    @ApiProperty({
        description: 'Export format',
        example: 'csv',
    })
    format: string;

    @ApiProperty({
        description: 'Export status',
        example: 'processing',
    })
    status: string;

    @ApiProperty({
        description: 'Number of documents exported',
        example: 100,
    })
    documentCount: number;

    @ApiPropertyOptional({
        description: 'Download URL',
        example: '/exports/export_12345.csv',
    })
    downloadUrl?: string;

    @ApiPropertyOptional({
        description: 'File size in bytes',
        example: 1024000,
    })
    fileSize?: number;

    @ApiProperty({
        description: 'Export timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    @ApiPropertyOptional({
        description: 'Completion timestamp',
        example: '2024-01-01T00:05:00.000Z',
    })
    completedAt?: Date;
}

// Queue Status Response DTOs
export class QueueStatusResponseDto {
    @ApiProperty({
        description: 'Queue name',
        example: 'document.upload.queue',
    })
    queueName: string;

    @ApiProperty({
        description: 'Number of messages in queue',
        example: 25,
    })
    messageCount: number;

    @ApiProperty({
        description: 'Number of consumers',
        example: 3,
    })
    consumerCount: number;

    @ApiProperty({
        description: 'Queue status',
        example: 'active',
    })
    status: string;

    @ApiProperty({
        description: 'Last message timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    lastMessageAt: Date;
}

// Error Response DTOs
export class DocumentErrorResponseDto {
    @ApiProperty({
        description: 'Error code',
        example: 'DOCUMENT_NOT_FOUND',
    })
    errorCode: string;

    @ApiProperty({
        description: 'Error message',
        example: 'Document not found',
    })
    message: string;

    @ApiProperty({
        description: 'Document ID if applicable',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    documentId?: string;

    @ApiProperty({
        description: 'Error timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    timestamp: Date;
}

// Simple Response DTOs
export class DocumentCreatedResponseDto {
    @ApiProperty({
        description: 'Document ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'File name',
        example: 'driver_license_12345.jpg',
    })
    fileName: string;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    createdAt: Date;
}

export class DocumentDeletedResponseDto {
    @ApiProperty({
        description: 'Document ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Deletion status',
        example: 'success',
    })
    status: string;

    @ApiProperty({
        description: 'Deletion timestamp',
        example: '2024-01-01T00:00:00.000Z',
    })
    deletedAt: Date;
}
