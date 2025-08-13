// src/hooks/useDocument.js
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import documentApi from '../api/documentApi';
import { useNotification } from '../context/NotificationContext';

export const useDocument = () => {
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();
    const [uploadProgress, setUploadProgress] = useState(0);

    // Common error handler
    const handleError = (error) => {
        const message = error.response?.data?.message || error.message;
        showNotification('error', message);
        throw error;
    };

    // Query hooks
    const useGetDocuments = (queryParams = {}) => {
        return useQuery({
            queryKey: ['documents', queryParams],
            queryFn: () => documentApi.getDocuments(queryParams),
            onError: handleError,
        });
    };

    const useGetDocumentById = (documentId) => {
        return useQuery({
            queryKey: ['document', documentId],
            queryFn: () => documentApi.getDocumentById(documentId),
            enabled: !!documentId,
            onError: handleError,
        });
    };

    const useGetDocumentStatistics = (queryParams = {}) => {
        return useQuery({
            queryKey: ['documentStatistics', queryParams],
            queryFn: () => documentApi.getDocumentStatistics(queryParams),
            onError: handleError,
        });
    };

    const useGetQueueStatus = () => {
        return useQuery({
            queryKey: ['documentQueueStatus'],
            queryFn: documentApi.getQueueStatus,
            onError: handleError,
        });
    };

    // Mutation hooks
    const useUploadDocument = () => {
        return useMutation({
            mutationFn: ({ entityType, entityId, data, file }) =>
                documentApi.uploadDocument(entityType, entityId, data, file),
            onSuccess: () => {
                queryClient.invalidateQueries(['documents']);
                showNotification('success', 'Document uploaded successfully');
            },
            onError: handleError,
        });
    };

    const useUploadMultipleDocuments = () => {
        return useMutation({
            mutationFn: ({ entityType, entityId, documents, files }) =>
                documentApi.uploadMultipleDocuments(entityType, entityId, documents, files),
            onSuccess: () => {
                queryClient.invalidateQueries(['documents']);
                showNotification('success', 'Documents uploaded successfully');
            },
            onError: handleError,
        });
    };

    const useProcessDocument = () => {
        return useMutation({
            mutationFn: ({ documentId, options }) =>
                documentApi.processDocument(documentId, options),
            onSuccess: () => {
                queryClient.invalidateQueries(['documents']);
                showNotification('success', 'Document queued for processing');
            },
            onError: handleError,
        });
    };

    const useBatchProcessDocuments = () => {
        return useMutation({
            mutationFn: ({ documentIds, options }) =>
                documentApi.batchProcessDocuments(documentIds, options),
            onSuccess: () => {
                queryClient.invalidateQueries(['documents']);
                showNotification('success', 'Documents queued for processing');
            },
            onError: handleError,
        });
    };

    const useVerifyDocument = () => {
        return useMutation({
            mutationFn: async (verificationData) => {
                try {
                    // Use your existing documentApi but with the new signature
                    const response = await documentApi.verifyDocument(
                        verificationData.documentId,
                        verificationData
                    );
                    return response.data;
                } catch (error) {
                    throw new Error(error.response?.data?.message || 'Network response was not ok');
                }
            },
            onSuccess: () => {
                queryClient.invalidateQueries(['documents']);
                showNotification('success', 'Document verification updated');
            },
            onError: (error) => {
                showNotification('error', error.message);
            }
        });
    };

    const useBatchVerifyDocuments = () => {
        return useMutation({
            mutationFn: (verifications) => documentApi.batchVerifyDocuments(verifications),
            onSuccess: () => {
                queryClient.invalidateQueries(['documents']);
                showNotification('success', 'Documents verification updated');
            },
            onError: handleError,
        });
    };

    const useUpdateDocument = () => {
        return useMutation({
            mutationFn: ({ documentId, updateData }) =>
                documentApi.updateDocument(documentId, updateData),
            onSuccess: () => {
                queryClient.invalidateQueries(['documents']);
                showNotification('success', 'Document updated successfully');
            },
            onError: handleError,
        });
    };

    const useDeleteDocument = () => {
        return useMutation({
            mutationFn: ({ documentId, permanent, reason }) =>
                documentApi.deleteDocument(documentId, permanent, reason),
            onSuccess: () => {
                queryClient.invalidateQueries(['documents']);
                showNotification('success', 'Document deleted successfully');
            },
            onError: handleError,
        });
    };

    const useBatchDeleteDocuments = () => {
        return useMutation({
            mutationFn: ({ documentIds, permanent, reason }) =>
                documentApi.batchDeleteDocuments(documentIds, permanent, reason),
            onSuccess: () => {
                queryClient.invalidateQueries(['documents']);
                showNotification('success', 'Documents deleted successfully');
            },
            onError: handleError,
        });
    };

    const useExportDocuments = () => {
        return useMutation({
            mutationFn: ({ format, includeFiles, filters }) =>
                documentApi.exportDocuments(format, includeFiles, filters),
            onSuccess: () => {
                showNotification('success', 'Export initiated successfully');
            },
            onError: handleError,
        });
    };


    return {
        uploadProgress,
        useGetDocuments,
        useGetDocumentById,
        useGetDocumentStatistics,
        useGetQueueStatus,
        useUploadDocument,
        useUploadMultipleDocuments,
        useProcessDocument,
        useBatchProcessDocuments,
        useVerifyDocument,
        useBatchVerifyDocuments,
        useUpdateDocument,
        useDeleteDocument,
        useBatchDeleteDocuments,
        useExportDocuments,
    };
};