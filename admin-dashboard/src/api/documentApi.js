// src/api/documentApi.js
import { ApiClient } from '../providers/AxiosClient';

const documentApi = {
    // Upload endpoints
    uploadDocument: (entityType, entityId, data, file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('documentType', data.documentType);
        if (data.priority) formData.append('priority', data.priority);
        if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));

        return ApiClient.post(`/documents/upload?entityType=${entityType}&entityId=${entityId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    uploadMultipleDocuments: (entityType, entityId, documents, files) => {
        const formData = new FormData();
        files.forEach((file) => formData.append('files', file));
        formData.append('entityType', entityType);
        formData.append('entityId', entityId);
        formData.append('documents', JSON.stringify(documents));

        return ApiClient.post('/documents/upload/multiple', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Processing endpoints
    processDocument: (documentId, options = {}) => {
        return ApiClient.post('/documents/process', {
            documentId,
            processingOptions: options,
        });
    },

    batchProcessDocuments: (documentIds, options = {}) => {
        return ApiClient.post('/documents/process/batch', {
            documentIds,
            processingOptions: options,
        });
    },

    // Verification endpoints
    verifyDocument: (documentId, verificationData) => {
        return ApiClient.patch(`/documents/${documentId}/verify`, verificationData);
    },

    batchVerifyDocuments: (verifications) => {
        return ApiClient.post('/documents/verify/batch', { verifications });
    },

    // Query endpoints
    getDocuments: (queryParams = {}) => {
        return ApiClient.get('/documents', { params: queryParams });
    },

    getDocumentById: (documentId) => {
        return ApiClient.get(`/documents/${documentId}`);
    },

    downloadDocument: (documentId) => {
        return ApiClient.get(`/documents/${documentId}/download`, {
            responseType: 'blob',
        });
    },

    // Statistics
    getDocumentStatistics: (queryParams = {}) => {
        return ApiClient.get('/documents/statistics', { params: queryParams });
    },

    // Management endpoints
    updateDocument: (documentId, updateData) => {
        return ApiClient.patch(`/documents/${documentId}`, updateData);
    },

    deleteDocument: (documentId, permanent = false, reason = '') => {
        return ApiClient.delete(`/documents/${documentId}`, {
            data: { permanent, reason },
        });
    },

    batchDeleteDocuments: (documentIds, permanent = false, reason = '') => {
        return ApiClient.delete('/documents/batch', {
            data: { documentIds, permanent, reason },
        });
    },

    // Queue status
    getQueueStatus: () => {
        return ApiClient.get('/documents/queue/status');
    },

    // Export
    exportDocuments: (format = 'csv', includeFiles = false, filters = {}) => {
        return ApiClient.post('/documents/export', {
            format,
            includeFiles,
            filters,
        });
    },
};

export default documentApi;