import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNumber,
    IsOptional,
    IsEnum,
    IsArray,
    IsBoolean,
    Min,
    Max,
    Length,
    IsInt,
    IsDateString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { DocumentPhotoEnum } from 'src/common/enum/document-photo.enum';
import { VerificationStatusEnum } from 'src/common/enum/status.enum';

// File Upload DTOs
export class UploadDocumentDto {
    @ApiProperty({
        description: 'Document type',
        enum: DocumentPhotoEnum,
        example: 'driver_license',
    })
    @IsEnum(DocumentPhotoEnum)
    documentType: string;

    @ApiPropertyOptional({
        description: 'Priority level for processing (1-10)',
        example: 5,
    })
    @IsOptional()
    @Type(() => Number)
    @Min(1)
    @Max(10)
    priority?: number;

    @ApiPropertyOptional({
        description: 'Additional metadata for the document',
        example: { expiry_date: '2025-12-31', issuing_authority: 'MINTP' },
    })
    @IsOptional()
    metadata?: Record<string, any>;
}

export class UploadMultipleDocumentsDto {
    @ApiProperty({
        description: 'Entity type (driver, vehicle, user)',
        example: 'driver',
    })
    @IsString()
    @Length(1, 20)
    entityType: string;

    @ApiProperty({
        description: 'Entity ID (driver_id, vehicle_id, user_id)',
        example: 1,
    })
    @IsUUID()
    entityId: string;

    @ApiProperty({
        description: 'Array of documents to upload',
        type: [UploadDocumentDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UploadDocumentDto)
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return [];
            }
        }
        return value;
    })
    documents: UploadDocumentDto[];
}

// Document Processing DTOs
export class ProcessDocumentDto {
    @ApiProperty({
        description: 'Document ID to process',
        example: 1,
    })
    @IsUUID()
    documentId: string;

    @ApiPropertyOptional({
        description: 'Processing options',
        example: { extract_text: true, validate_format: true },
    })
    @IsOptional()
    processingOptions?: Record<string, any>;
}

export class BatchProcessDocumentsDto {
    @ApiProperty({
        description: 'Array of document IDs to process',
        example: [
            '123e4567-e89b-12d3-a456-426614174000',
            '123e4567-e89b-12d3-a456-426614174001',
            '123e4567-e89b-12d3-a456-426614174002',
        ],
    })
    @IsArray()
    @IsUUID('4', { each: true })
    documentIds: string[];

    @ApiPropertyOptional({
        description: 'Processing options for all documents',
        example: { extract_text: true, validate_format: true },
    })
    @IsOptional()
    processingOptions?: Record<string, any>;
}

// Document Verification DTOs
export class VerifyDocumentDto {
    @ApiProperty({
        description: 'Document ID to verify',
        example: 1,
    })
    @IsUUID()
    documentId: string;

    @ApiProperty({
        description: 'Verification status',
        enum: VerificationStatusEnum,
        example: 'approved',
    })
    @IsEnum(VerificationStatusEnum)
    verificationStatus: string;

    @ApiPropertyOptional({
        description: 'Comments or notes about the verification',
        example: 'Document verified successfully. All information is correct.',
    })
    @IsOptional()
    @IsString()
    @Length(1, 1000)
    comments?: string;

    @ApiPropertyOptional({
        description: 'Rejection reason if status is rejected',
        example: 'Document is expired or unclear',
    })
    @IsOptional()
    @IsString()
    @Length(1, 500)
    rejectionReason?: string;

    @ApiPropertyOptional({
        description: 'Additional verification metadata',
        example: { verified_by_system: true, confidence_score: 0.95 },
    })
    @IsOptional()
    metadata?: Record<string, any>;
}

export class BatchVerifyDocumentsDto {
    @ApiProperty({
        description: 'Array of document verification requests',
        type: [VerifyDocumentDto],
    })
    @IsArray()
    verifications: VerifyDocumentDto[];
}

// Document Query DTOs
export class DocumentQueryDto {
    @ApiPropertyOptional({
        description: 'Search term for file name or metadata',
        example: 'license',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Entity type filter',
        example: 'driver',
    })
    @IsOptional()
    @IsString()
    entityType?: string;

    @ApiPropertyOptional({
        description: 'Entity ID filter',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    entityId?: number;

    @ApiPropertyOptional({
        description: 'Document type filter',
        enum: DocumentPhotoEnum,
    })
    @IsOptional()
    @IsEnum(DocumentPhotoEnum)
    documentType?: string;

    @ApiPropertyOptional({
        description: 'Verification status filter',
        enum: VerificationStatusEnum,
    })
    @IsOptional()
    @IsEnum(VerificationStatusEnum)
    verificationStatus?: string;

    @ApiPropertyOptional({
        description: 'Filter by verification date range (start)',
        example: '2024-01-01',
    })
    @IsOptional()
    @IsDateString()
    verifiedFrom?: string;

    @ApiPropertyOptional({
        description: 'Filter by verification date range (end)',
        example: '2024-12-31',
    })
    @IsOptional()
    @IsDateString()
    verifiedTo?: string;

    @ApiPropertyOptional({
        description: 'Filter by upload date range (start)',
        example: '2024-01-01',
    })
    @IsOptional()
    @IsDateString()
    uploadedFrom?: string;

    @ApiPropertyOptional({
        description: 'Filter by upload date range (end)',
        example: '2024-12-31',
    })
    @IsOptional()
    @IsDateString()
    uploadedTo?: string;

    @ApiPropertyOptional({
        description: 'Filter by verified by user ID',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    verifiedBy?: number;

    @ApiPropertyOptional({
        description: 'Filter by uploaded by user ID',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    uploadedBy?: number;

    @ApiPropertyOptional({
        description: 'Page number for pagination',
        example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Sort field',
        example: 'createdAt',
    })
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({
        description: 'Sort order',
        example: 'DESC',
    })
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// Document Update DTOs
export class UpdateDocumentDto {
    @ApiPropertyOptional({
        description: 'Document type',
        enum: DocumentPhotoEnum,
    })
    @IsOptional()
    @IsEnum(DocumentPhotoEnum)
    documentType?: string;

    @ApiPropertyOptional({
        description: 'Additional metadata for the document',
        example: { expiry_date: '2025-12-31', issuing_authority: 'MINTP' },
    })
    @IsOptional()
    metadata?: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Whether the document is active',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

// Document Deletion DTOs
export class DeleteDocumentDto {
    @ApiProperty({
        description: 'Document ID to delete',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    documentId: string;

    @ApiPropertyOptional({
        description: 'Reason for deletion',
        example: 'Document replaced with updated version',
    })
    @IsOptional()
    @IsString()
    @Length(1, 500)
    reason?: string;

    @ApiPropertyOptional({
        description: 'Whether to permanently delete the file',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    permanent?: boolean = false;
}

export class BatchDeleteDocumentsDto {
    @ApiProperty({
        description: 'Array of document IDs to delete',
        example: [
            '123e4567-e89b-12d3-a456-426614174000',
            '123e4567-e89b-12d3-a456-426614174001',
            '123e4567-e89b-12d3-a456-426614174002',
        ],
    })
    @IsArray()
    @IsUUID('4', { each: true })
    documentIds: string[];

    @ApiPropertyOptional({
        description: 'Reason for deletion',
        example: 'Bulk cleanup of expired documents',
    })
    @IsOptional()
    @IsString()
    @Length(1, 500)
    reason?: string;

    @ApiPropertyOptional({
        description: 'Whether to permanently delete the files',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    permanent?: boolean = false;
}

// Document Processing Status DTOs
export class UpdateProcessingStatusDto {
    @ApiProperty({
        description: 'Document ID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    documentId: string;

    @ApiProperty({
        description: 'Processing status',
        example: 'processing',
    })
    @IsString()
    status: string;

    @ApiPropertyOptional({
        description: 'Processing progress (0-100)',
        example: 75,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    progress?: number;

    @ApiPropertyOptional({
        description: 'Processing result or error message',
        example: 'Text extraction completed successfully',
    })
    @IsOptional()
    @IsString()
    result?: string;

    @ApiPropertyOptional({
        description: 'Processing metadata',
        example: { extracted_text: 'Sample text', confidence: 0.95 },
    })
    @IsOptional()
    metadata?: Record<string, any>;
}

// Document Export DTOs
export class ExportDocumentsDto {
    @ApiPropertyOptional({
        description: 'Export format',
        example: 'csv',
    })
    @IsOptional()
    @IsString()
    format?: string = 'csv';

    @ApiPropertyOptional({
        description: 'Include file data in export',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    includeFiles?: boolean = false;

    @ApiPropertyOptional({
        description: 'Filter criteria for export',
        example: { entityType: 'driver', verificationStatus: 'approved' },
    })
    @IsOptional()
    filters?: Record<string, any>;
}

// Document Statistics Query DTOs
export class DocumentStatisticsQueryDto {
    @ApiPropertyOptional({
        description: 'Entity type filter',
        example: 'driver',
    })
    @IsOptional()
    @IsString()
    entityType?: string;

    @ApiPropertyOptional({
        description: 'Date range start',
        example: '2024-01-01',
    })
    @IsOptional()
    @IsDateString()
    fromDate?: string;

    @ApiPropertyOptional({
        description: 'Date range end',
        example: '2024-12-31',
    })
    @IsOptional()
    @IsDateString()
    toDate?: string;

    @ApiPropertyOptional({
        description: 'Group by field',
        example: 'documentType',
    })
    @IsOptional()
    @IsString()
    groupBy?: string;
}
