import React from 'react';
import { motion } from 'framer-motion';
import {
    Eye,
    Download,
    Settings,
    Trash2,
    FileImage,
    // FilePdf,
    FileText,
    Car,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
} from 'lucide-react';

const DocumentTable = ({
    documents = [], // Provide default empty array
    selectedDocuments = [], // Provide default empty array
    onSelectDocument = () => { }, // Provide default functions
    onSelectAll = () => { },
    onViewDocument = () => { },
    onProcessDocument = () => { },
    onDeleteDocument = () => { }
}) => {
    const getDocumentIcon = (mimeType, documentType) => {
        if (mimeType?.includes('pdf')) return <FilePdf className="text-red-600" />;
        if (mimeType?.includes('image')) return <FileImage className="text-blue-600" />;
        if (documentType?.includes('VEHICLE')) return <Car className="text-green-600" />;
        return <FileText className="text-gray-600" />;
    };

    const getStatusBadge = (status) => {
        const configs = {
            pending: {
                bg: 'bg-amber-100',
                text: 'text-amber-800',
                icon: <Clock className="w-3 h-3" />,
                label: 'Pending'
            },
            approved: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                icon: <CheckCircle className="w-3 h-3" />,
                label: 'Approved'
            },
            rejected: {
                bg: 'bg-red-100',
                text: 'text-red-800',
                icon: <XCircle className="w-3 h-3" />,
                label: 'Rejected'
            },
            processing: {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                icon: <Settings className="w-3 h-3 animate-spin" />,
                label: 'Processing'
            },
        };

        const config = configs[status] || configs.pending;

        return (
            <span className={`inline-flex items-center px-2 py-1 ${config.bg} ${config.text} text-xs rounded-full`}>
                {config.icon}
                <span className="ml-1">{config.label}</span>
            </span>
        );
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left">
                                <input
                                    type="checkbox"
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                    checked={selectedDocuments.length === documents.length && documents.length > 0}
                                    className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                                />
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Document
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Entity
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Processing
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Uploaded
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map((document, index) => {
                            const dateInfo = formatDate(document.createdAt);
                            const isSelected = selectedDocuments.includes(document.id);

                            return (
                                <motion.tr
                                    key={document.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => onSelectDocument(document.id, e.target.checked)}
                                            className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                                {getDocumentIcon(document.mimeType, document.documentType)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {document.documentType?.replace(/_/g, ' ')}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formatFileSize(document.fileSize)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{document.entityType}</div>
                                        <div className="text-sm text-gray-500">ID: {document.entityId.substring(0, 10)}...</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            {document.documentType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(document.verificationStatus)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full"
                                                    style={{ width: `${document.processingProgress || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-600">{document.processingProgress || 0}%</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Processing</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{dateInfo.date}</div>
                                        <div className="text-sm text-gray-500">{dateInfo.time}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => onViewDocument(document.id)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="View"
                                            >
                                                <Eye size={20} />
                                            </button>
                                            <button
                                                onClick={() => window.open(`/api/documents/${document.id}/download`, '_blank')}
                                                className="text-green-600 hover:text-green-800"
                                                title="Download"
                                            >
                                                <Download size={20} />
                                            </button>
                                            <button
                                                onClick={() => onProcessDocument(document.id)}
                                                className="text-purple-600 hover:text-purple-800"
                                                title="Process"
                                            >
                                                <Settings size={20} />
                                            </button>
                                            <button
                                                onClick={() => onDeleteDocument(document.id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DocumentTable;
