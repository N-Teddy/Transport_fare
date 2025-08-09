// src/api/documentService.ts

import type { AxiosProgressEvent } from "axios";
import { apiClient } from "../provider/axiosClient";
import type { UploadDocumentDto, UploadMultipleDocumentsDto, UploadMultipleResponseDto, UploadResponseDto } from "../types/document";
import { API_ENDPOINTS } from "./apiEndpoints";


export const DocumentService = {
    uploadDocument: async (
        file: File,
        uploadDto: Omit<UploadDocumentDto, 'file'>,
        onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
    ) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', uploadDto.documentType);
        formData.append('entityType', uploadDto.entityType);
        formData.append('entityId', uploadDto.entityId);

        if (uploadDto.priority) {
            formData.append('priority', uploadDto.priority.toString());
        }
        if (uploadDto.metadata) {
            formData.append('metadata', JSON.stringify(uploadDto.metadata));
        }

        const response = await apiClient.post<UploadResponseDto>(
            API_ENDPOINTS.DOCUMENT.CREATE,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress,
            }
        );
        return response.data;
    },

    uploadMultipleDocuments: async (
        files: File[],
        uploadDto: UploadMultipleDocumentsDto,
        onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
    ) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append(`files`, file);
        });
        formData.append('entityType', uploadDto.entityType);
        formData.append('entityId', uploadDto.entityId);
        formData.append('documents', JSON.stringify(uploadDto.documents));

        const response = await apiClient.post<UploadMultipleResponseDto>(
            API_ENDPOINTS.DOCUMENT.CREATE_MULTIPLE,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress,
            }
        );
        return response.data;
    },
    // ... rest of the service
};