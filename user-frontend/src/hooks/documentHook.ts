// src/hooks/api/documentHooks.ts
import { useMutation } from '@tanstack/react-query';
import type { UploadDocumentDto, UploadMultipleDocumentsDto } from '../types/document';
import type { AxiosProgressEvent } from 'axios';
import { DocumentService } from '../api/documentService';


export const useUploadDocument = () => {
    return useMutation({
        mutationFn: ({
            file,
            uploadDto,
            onUploadProgress
        }: {
            file: File;
            uploadDto: Omit<UploadDocumentDto, 'file'>;
            onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
        }) => DocumentService.uploadDocument(file, uploadDto, onUploadProgress),
    });
};

export const useUploadMultipleDocuments = () => {
    return useMutation({
        mutationFn: ({
            files,
            uploadDto,
            onUploadProgress
        }: {
            files: File[];
            uploadDto: UploadMultipleDocumentsDto;
            onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
        }) => DocumentService.uploadMultipleDocuments(files, uploadDto, onUploadProgress),
    });
};
// ... rest of the hooks