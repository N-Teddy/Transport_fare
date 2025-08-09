// src/pages/DocumentRegistrationPage.tsx

import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Loader2, PlusCircle, Trash2, AlertTriangle, UploadCloud, User, Car, Upload, Check } from 'lucide-react';
import { DocumentPhotoEnum, type DocumentPhoto, type UploadMultipleDocumentsDto } from '../types/document';
import { useUploadMultipleDocuments } from '../hooks/documentHook';
import { motion, AnimatePresence } from 'framer-motion';
import Stepper from '../components/ui/Stepper';

// Define the structure for a single document in the local state
interface DocumentToUpload {
  id: number;
  file: File | null;
  type: DocumentPhoto;
}

// Provided document types for the select dropdown
const documentTypes = [
  { value: DocumentPhotoEnum.NATIONAL_ID, label: 'National ID' },
  { value: DocumentPhotoEnum.DRIVER_LICENSE, label: 'Driver License' },
  { value: DocumentPhotoEnum.PROFILE_PHOTO, label: 'Profile Photo' },
  { value: DocumentPhotoEnum.VEHICLE_REGISTRATION, label: 'Vehicle Registration Card' },
  { value: DocumentPhotoEnum.INSURANCE_CERTIFICATE, label: 'Insurance Certificate' },
  { value: DocumentPhotoEnum.INSPECTION_REPORT, label: 'Vehicle Inspection Report' },
  { value: DocumentPhotoEnum.VEHICLE_PHOTO, label: 'Photo of Vehicle' },
];

const steps = [
  {
    id: 1,
    title: 'Personal Info',
    description: 'Basic details',
    icon: User,
  },
  {
    id: 2,
    title: 'Vehicle Details',
    description: 'Car information',
    icon: Car,
  },
  {
    id: 3,
    title: 'Documents',
    description: 'Upload files',
    icon: Upload,
  },
];

const DocumentRegistrationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const driverId = searchParams.get('driverId');
  const vehicleId = searchParams.get('vehicleId');

  const uploadMutation = useUploadMultipleDocuments();
  const [documents, setDocuments] = useState<DocumentToUpload[]>([]);

  useEffect(() => {
    if (!driverId || !vehicleId) {
      toast.error('Invalid session. Please start registration again.');
      navigate('/register');
    } else {
      // Start with one document row
      addDocumentRow();
    }
  }, [driverId, vehicleId, navigate]);

  const addDocumentRow = () => {
    setDocuments((prev) => [
      ...prev,
      { id: Date.now(), file: null, type: DocumentPhotoEnum.NATIONAL_ID },
    ]);
  };

  const removeDocumentRow = (id: number) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleFileChange = (id: number, file: File | null) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, file } : doc))
    );
  };

  const handleTypeChange = (id: number, type: DocumentPhoto) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, type } : doc))
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!driverId) {
      toast.error('Driver ID is missing.');
      return;
    }
    if (documents.length === 0) {
      toast.error('Please add at least one document to upload.');
      return;
    }

    const validDocuments = documents.filter((doc) => doc.file);
    if (validDocuments.length !== documents.length) {
      toast.error('Please ensure every row has a file selected.');
      return;
    }

    const files = validDocuments.map((doc) => doc.file as File);
    const uploadDto: UploadMultipleDocumentsDto = {
      entityType: 'driver',
      entityId: driverId,
      documents: validDocuments.map((doc) => ({
        documentType: doc.type,
      })),
    };

    toast.promise(
      uploadMutation.mutateAsync({ files, uploadDto }),
      {
        loading: 'Uploading documents...',
        success: 'Registration complete! Thank you.',
        error: 'Failed to upload documents. Please try again.',
      }
    ).then(() => {
      navigate('/'); // Redirect on success
    });
  };

  if (!driverId || !vehicleId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Access</h2>
          <p className="text-gray-600">Redirecting you to the start of the registration process...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-bounce-in">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <UploadCloud className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Document Upload
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload the required documents to complete your registration
          </p>
        </div>

        {/* Stepper Component */}
        <Stepper currentStep={3} steps={steps} />

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6 text-white">
              <div className="flex items-center space-x-3">
                <UploadCloud className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">Upload Documents</h2>
                  <p className="text-emerald-100">Almost done! Just upload your documents</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className="w-12 h-12 text-emerald-600" />
                </div>
                <p className="text-gray-600 text-lg">
                  Upload the required documents to complete your registration
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {documents.map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:from-emerald-50 hover:to-emerald-100 transition-all duration-300 p-6 rounded-xl"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-500 text-white rounded-full font-bold text-sm">
                              {index + 1}
                            </span>
                          </div>

                          <div className="flex-grow space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Document Type
                              </label>
                              <select
                                value={doc.type}
                                onChange={(e) => handleTypeChange(doc.id, e.target.value as DocumentPhoto)}
                                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 focus:outline-none bg-white shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                {documentTypes.map((type) => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Choose File
                              </label>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileChange(doc.id, e.target.files ? e.target.files[0] : null)}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 file:transition-colors file:duration-200 file:shadow-sm hover:file:shadow-md"
                              />
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => removeDocumentRow(doc.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-3 rounded-xl transition-colors duration-200 group"
                            >
                              <Trash2 className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <motion.button
                  type="button"
                  onClick={addDocumentRow}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors duration-200 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>Add Document</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:shadow-none"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentRegistrationPage;
