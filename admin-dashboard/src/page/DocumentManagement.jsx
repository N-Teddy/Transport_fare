import React, { useState } from 'react';
import DocumentSkeleton from '../components/skeletons/DocumentSkeleton';
import DocumentTable from '../components/documents/DocumentTable';
import DocumentViewer from '../components/documents/DocumentViewer';
import { useDocument } from '../hook/documentHook';

const DocumentManagement = () => {
    const { data: documents, isLoading, refetch } = useDocument();
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [currentDocumentId, setCurrentDocumentId] = useState(null);

    const handleSelectDocument = (id, isSelected) => {
        setSelectedDocuments(prev =>
            isSelected ? [...prev, id] : prev.filter(docId => docId !== id)
        );
    };

    const handleSelectAll = (isSelected) => {
        if (isSelected) {
            setSelectedDocuments(documents.map(doc => doc.id));
        } else {
            setSelectedDocuments([]);
        }
    };

    const handleViewDocument = (id) => {
        setCurrentDocumentId(id);
        setIsViewerOpen(true);
    };

    const handleDeleteDocument = (id) => {
        // Implement delete logic here
        console.log(`Delete document with ID: ${id}`);
    };

    const handleProcessDocument = (id) => {
        // Implement process logic here
        console.log(`Process document with ID: ${id}`);
    };

    const handleVerificationUpdate = () => {
        refetch();
    };

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Document Management</h1>
            {isLoading ? (
                <DocumentSkeleton />
            ) : (
                <DocumentTable
                    documents={documents}
                    selectedDocuments={selectedDocuments}
                    onSelectDocument={handleSelectDocument}
                    onSelectAll={handleSelectAll}
                    onViewDocument={handleViewDocument}
                    onProcessDocument={handleProcessDocument}
                    onDeleteDocument={handleDeleteDocument}
                />
            )}
            <DocumentViewer
                documentId={currentDocumentId}
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                onVerificationUpdate={handleVerificationUpdate}
            />
        </div>
    );
};

export default DocumentManagement;
