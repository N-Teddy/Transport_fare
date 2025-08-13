import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ZoomIn,
    ZoomOut,
    Maximize2,
    RotateCw,
    Download,
    RefreshCw,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react';
import { useDocument } from '../../hook/documentHook';
import Skeleton from '../skeletons/Skeleton';

const DocumentViewer = ({ documentId, isOpen, onClose, onVerificationUpdate }) => {
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [verificationStatus, setVerificationStatus] = useState('');
    const [comments, setComments] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { useGetDocumentById, useVerifyDocument } = useDocument();
    const { data: document, isLoading, refetch } = useGetDocumentById(documentId);
    const verifyMutation = useVerifyDocument();

    useEffect(() => {
        if (document?.data) {
            setVerificationStatus(document.data.verificationStatus || 'pending');
        }
    }, [document]);

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 25, 200));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 25, 25));
    };

    const handleResetZoom = () => {
        setZoom(100);
        setRotation(0);
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleVerificationSubmit = async () => {
        if (!verificationStatus) return;

        setIsSubmitting(true);
        try {
            await verifyMutation.mutateAsync({
                documentId,
                verificationData: {
                    documentId,
                    verificationStatus,
                    comments,
                    rejectionReason: verificationStatus === 'rejected' ? rejectionReason : null,
                    metadata: {
                        verified_at: new Date().toISOString(),
                    },
                },
            });

            onVerificationUpdate();
            onClose();
        } catch (error) {
            console.error('Verification error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-4 h-4" />;
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            case 'pending':
                return <Clock className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-amber-100 text-amber-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">Document Review & Verification</h3>
                                <p className="text-sm text-gray-600 mt-1">Review the document and update verification status</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex flex-col lg:flex-row h-[calc(95vh-180px)]">
                            {/* Document Viewer */}
                            <div className="flex-1 p-6 overflow-auto bg-gray-50">
                                {isLoading ? (
                                    <div className="bg-white rounded-lg shadow-lg p-4 min-h-[500px] flex items-center justify-center">
                                        <div className="text-center">
                                            <Skeleton variant="circle" className="w-16 h-16 mx-auto mb-4" />
                                            <Skeleton variant="text" className="w-32 h-4 mx-auto" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {/* Zoom Controls */}
                                        <div className="absolute top-4 right-4 bg-black bg-opacity-70 rounded-lg p-2 flex items-center space-x-2 z-10">
                                            <button
                                                onClick={handleZoomIn}
                                                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded transition-colors"
                                                title="Zoom In"
                                            >
                                                <ZoomIn size={20} />
                                            </button>
                                            <button
                                                onClick={handleZoomOut}
                                                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded transition-colors"
                                                title="Zoom Out"
                                            >
                                                <ZoomOut size={20} />
                                            </button>
                                            <button
                                                onClick={handleResetZoom}
                                                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded transition-colors"
                                                title="Reset"
                                            >
                                                <Maximize2 size={20} />
                                            </button>
                                            <button
                                                onClick={handleRotate}
                                                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded transition-colors"
                                                title="Rotate"
                                            >
                                                <RotateCw size={20} />
                                            </button>
                                            <span className="text-white text-sm px-2">{zoom}%</span>
                                        </div>

                                        {/* Document Display */}
                                        <div className="bg-white rounded-lg shadow-lg p-4 min-h-[500px] flex items-center justify-center overflow-hidden">
                                            {document?.data?.mimeType?.includes('image') ? (
                                                <img
                                                    src={`/api/documents/${documentId}/file`}
                                                    alt="Document"
                                                    className="max-w-full h-auto transition-transform duration-300"
                                                    style={{
                                                        transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                                                    }}
                                                />
                                            ) : document?.data?.mimeType?.includes('pdf') ? (
                                                <iframe
                                                    src={`/api/documents/${documentId}/file`}
                                                    className="w-full h-[600px] rounded-lg"
                                                    title="PDF Document"
                                                />
                                            ) : (
                                                <div className="text-center text-gray-500">
                                                    <AlertCircle size={48} className="mx-auto mb-4" />
                                                    <p>Unable to preview this document type</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Information & Verification Panel */}
                            <div className="w-full lg:w-96 border-l border-gray-200 bg-white overflow-auto">
                                {isLoading ? (
                                    <div className="p-6 space-y-6">
                                        <Skeleton variant="text" className="w-full h-6 mb-4" />
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i}>
                                                <Skeleton variant="text" className="w-20 h-4 mb-2" />
                                                <Skeleton variant="text" className="w-full h-4" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                  <>
                                        {/* Document Information */}
                                        <div className="p-6 border-b border-gray-200">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Document Information</h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Document Type</label>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {document?.data?.documentType?.replace(/_/g, ' ')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Entity</label>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {document?.data?.entityType} ({document?.data?.entityId?.substring(0, 10)}...)
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase tracking-wider">File Size</label>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {formatFileSize(document?.data?.fileSize)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Upload Date</label>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {new Date(document?.data?.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase tracking-wider">Current Status</label>
                                                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(document?.data?.verificationStatus)}`}>
                                                        {getStatusIcon(document?.data?.verificationStatus)}
                                                        <span className="ml-1">{document?.data?.verificationStatus}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Processing Information */}
                                        {document?.data?.processingMetadata && (
                                            <div className="p-6 border-b border-gray-200 bg-blue-50">
                                                <h4 className="text-sm font-semibold text-gray-800 mb-3">Processing Information</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-600">Progress</span>
                                                        <div className="flex items-center">
                                                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                                                <div
                                                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                                    style={{ width: `${document?.data?.processingMetadata?.progress || 0}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-gray-600">
                                                                {document?.data?.processingMetadata?.progress || 0}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {document?.data?.processingMetadata?.extracted_text && (
                                                        <div>
                                                            <span className="text-xs text-gray-600">Extracted Text</span>
                                                            <p className="text-xs text-gray-800 mt-1">
                                                                {document?.data?.processingMetadata?.extracted_text}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {document?.data?.processingMetadata?.confidence && (
                                                        <div>
                                                            <span className="text-xs text-gray-600">Confidence Score</span>
                                                            <p className="text-xs text-gray-800">
                                                                {(document?.data?.processingMetadata?.confidence * 100).toFixed(0)}%
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Verification Form */}
                                        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Verification</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Verification Status
                                                    </label>
                                                    <select
                                                        value={verificationStatus}
                                                        onChange={(e) => setVerificationStatus(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                    >
                                                        <option value="pending">⏳ Keep Pending</option>
                                                        <option value="approved">✅ Approve</option>
                                                        <option value="rejected">❌ Reject</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Comments
                                                    </label>
                                                    <textarea
                                                        value={comments}
                                                        onChange={(e) => setComments(e.target.value)}
                                                        rows={3}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                        placeholder="Add verification comments..."
                                                    />
                                                </div>

                                                {verificationStatus === 'rejected' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                    >
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Rejection Reason
                                                        </label>
                                                        <select
                                                            value={rejectionReason}
                                                            onChange={(e) => setRejectionReason(e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                        >
                                                            <option value="">Select reason...</option>
                                                            <option value="expired">Document is expired</option>
                                                            <option value="unclear">Document is unclear/illegible</option>
                                                            <option value="invalid">Invalid document type</option>
                                                            <option value="mismatch">Information mismatch</option>
                                                            <option value="other">Other (specify in comments)</option>
                                                        </select>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Verification History */}
                                        {document?.data?.verificationComments && (
                                            <div className="p-6 border-t border-gray-200 bg-gray-50">
                                                <h4 className="text-sm font-semibold text-gray-800 mb-3">Previous Comments</h4>
                                                <p className="text-sm text-gray-600">
                                                    {document?.data?.verificationComments}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => window.open(`/api/documents/${documentId}/download`, '_blank')}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                                >
                                    <Download size={20} className="mr-2" />
                                    Download
                                </button>
                                <button
                                    onClick={() => refetch()}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                                >
                                    <RefreshCw size={20} className="mr-2" />
                                    Refresh
                                </button>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleVerificationSubmit}
                                    disabled={isSubmitting || !verificationStatus}
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RefreshCw size={20} className="mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={20} className="mr-2" />
                                            Save Verification
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DocumentViewer;
