// src/types/document.ts
export const DocumentPhotoEnum = {
    DRIVER_LICENSE: 'DRIVER_LICENSE',
    VEHICLE_REGISTRATION: 'VEHICLE_REGISTRATION',
    INSURANCE_CERTIFICATE: 'INSURANCE_CERTIFICATE',
    NATIONAL_ID: 'NATIONAL_ID',
    PROFILE_PHOTO: 'PROFILE_PHOTO',
    VEHICLE_PHOTO: 'VEHICLE_PHOTO',
    INSPECTION_REPORT: 'INSPECTION_REPORT',
    OTHER: 'OTHER',
} as const;

export type DocumentPhoto = keyof typeof DocumentPhotoEnum;

export interface UploadDocumentDto {
    entityType: string;
    entityId: string;
    documentType: DocumentPhoto;
    priority?: number;
    metadata?: Record<string, any>;
}

export interface UploadResponseDto {
    id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    status: string;
    queueId: string;
    createdAt: Date;
}

export interface UploadMultipleDocumentsDto {
    entityType: string;
    entityId: string;
    documents: Array<{
        documentType: DocumentPhoto;
        priority?: number;
        metadata?: Record<string, any>;
    }>;
}

export interface UploadMultipleResponseDto {
    uploads: UploadResponseDto[];
    successCount: number;
    failureCount: number;
    errors: string[];
}

export interface DocumentResponseDto {
    id: string;
    entityType: string;
    entityId: string;
    documentType: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    status: string;
    verified: boolean;
    verifiedBy?: string;
    verifiedAt?: Date;
    priority?: number;
    metadata?: Record<string, any>;
    uploadedBy: string;
    createdAt: Date;
    updatedAt: Date;
}