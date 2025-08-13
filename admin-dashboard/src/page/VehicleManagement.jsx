// src/components/VehicleManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Car,
    Bus,
    Truck,
    Plus,
    Edit,
    Eye,
    Trash2,
    X,
    Menu,
    ChevronLeft,
    ChevronRight,
    Filter,
    Search,
    AlertTriangle,
    FileWarning,
    Camera,
    CameraOff,
    CheckCircle,
    Layers,
    Users as UsersIcon,
    ClipboardCheck,
    Download,
    ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import {
    useVehicles,
    useVehicle,
    useUpdateVehicle,
    useVehicleStatistics,
    useVehicleTypes,
    useVehicleType,
    useCreateVehicleType,
    useUpdateVehicleType,
    useDeleteVehicleType,
    useVehicleTypeStatistics,
    useBulkUpdateVehicleStatus
} from '../hook/VehicleHook';

const VehicleManagement = () => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const [activeTab, setActiveTab] = useState('vehicles');
    const [selectedVehicles, setSelectedVehicles] = useState([]);

    // Filter states for vehicles
    const [vehicleFilters, setVehicleFilters] = useState({
        search: '',
        vehicleTypeId: '',
        status: '',
        photosVerified: '',
        insuranceStatus: '',
        inspectionStatus: '',
        page: 1,
        limit: 10
    });

    // Filter states for vehicle types
    const [typeFilters, setTypeFilters] = useState({
        search: '',
        requiresHelmet: '',
        page: 1,
        limit: 10
    });

    // Modal states
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [typeModalOpen, setTypeModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteTypeModalOpen, setDeleteTypeModalOpen] = useState(false);
    const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);

    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [modalMode, setModalMode] = useState('add');

    // Form states
    const [vehicleStatus, setVehicleStatus] = useState('active');
    const [bulkStatus, setBulkStatus] = useState('active');

    const [typeForm, setTypeForm] = useState({
        typeName: '',
        description: '',
        maxPassengers: 1,
        requiresHelmet: false
    });

    // Clean filters for API
    const cleanVehicleFilters = useMemo(() => {
        const cleaned = { page: vehicleFilters.page, limit: vehicleFilters.limit };
        Object.keys(vehicleFilters).forEach(key => {
            if (vehicleFilters[key] && key !== 'page' && key !== 'limit') {
                if (key === 'photosVerified' && vehicleFilters[key] !== '') {
                    cleaned[key] = vehicleFilters[key] === 'true';
                } else if (vehicleFilters[key]) {
                    cleaned[key] = vehicleFilters[key];
                }
            }
        });
        return cleaned;
    }, [vehicleFilters]);

    const cleanTypeFilters = useMemo(() => {
        const cleaned = { page: typeFilters.page, limit: typeFilters.limit };
        if (typeFilters.search) cleaned.search = typeFilters.search;
        if (typeFilters.requiresHelmet !== '') {
            cleaned.requiresHelmet = typeFilters.requiresHelmet === 'true';
        }
        return cleaned;
    }, [typeFilters]);

    // API Hooks
    const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles(cleanVehicleFilters);
    const { data: vehicleStats } = useVehicleStatistics();
    const { data: typesData, isLoading: typesLoading } = useVehicleTypes(cleanTypeFilters);
    const { data: typeStats } = useVehicleTypeStatistics();
    const { data: selectedVehicleData } = useVehicle(selectedVehicle?.id);
    const { data: selectedTypeData } = useVehicleType(selectedType?.id);

    // Mutations
    const updateVehicleMutation = useUpdateVehicle();
    const createTypeMutation = useCreateVehicleType();
    const updateTypeMutation = useUpdateVehicleType();
    const deleteTypeMutation = useDeleteVehicleType();
    const bulkStatusMutation = useBulkUpdateVehicleStatus();

    // Data
    const vehicles = useMemo(() => vehiclesData?.data?.items || [], [vehiclesData]);
    const vehiclePagination = useMemo(() => vehiclesData?.data?.pagination || {}, [vehiclesData]);
    const types = useMemo(() => typesData?.data?.items || [], [typesData]);
    const typePagination = useMemo(() => typesData?.data?.pagination || {}, [typesData]);
    const stats = vehicleStats?.data || {};
    const typeStatsData = typeStats?.data || {};

    // Handle responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            setSidebarOpen(window.innerWidth >= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update form when editing
    useEffect(() => {
        if (modalMode === 'edit' && selectedType && selectedTypeData?.data) {
            const type = selectedTypeData.data;
            setTypeForm({
                typeName: type.typeName || '',
                description: type.description || '',
                maxPassengers: type.maxPassengers || 1,
                requiresHelmet: type.requiresHelmet || false
            });
        }
    }, [modalMode, selectedType, selectedTypeData]);

    useEffect(() => {
        if (selectedVehicle) {
            setVehicleStatus(selectedVehicle.status || 'active');
        }
    }, [selectedVehicle]);

    // Handlers
    const handleVehicleFilterChange = (key, value) => {
        setVehicleFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handleTypeFilterChange = (key, value) => {
        setTypeFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedVehicles(vehicles.map(v => v.id));
        } else {
            setSelectedVehicles([]);
        }
    };

    const handleSelectVehicle = (vehicleId) => {
        setSelectedVehicles(prev => {
            if (prev.includes(vehicleId)) {
                return prev.filter(id => id !== vehicleId);
            }
            return [...prev, vehicleId];
        });
    };

    const openStatusModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setVehicleStatus(vehicle.status || 'active');
        setStatusModalOpen(true);
    };

    const openViewModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setViewModalOpen(true);
    };

    const openAddTypeModal = () => {
        setModalMode('add');
        setSelectedType(null);
        setTypeForm({
            typeName: '',
            description: '',
            maxPassengers: 1,
            requiresHelmet: false
        });
        setTypeModalOpen(true);
    };

    const openEditTypeModal = (type) => {
        setModalMode('edit');
        setSelectedType(type);
        setTypeModalOpen(true);
    };

    const openDeleteTypeModal = (type) => {
        setSelectedType(type);
        setDeleteTypeModalOpen(true);
    };

    const handleUpdateVehicleStatus = async () => {
        try {
            await updateVehicleMutation.mutateAsync({
                id: selectedVehicle.id,
                data: { status: vehicleStatus }
            });
            toast.success('Vehicle status updated successfully');
            setStatusModalOpen(false);
            setSelectedVehicle(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleBulkStatusUpdate = async () => {
        try {
            await bulkStatusMutation.mutateAsync({
                vehicleIds: selectedVehicles,
                status: bulkStatus
            });
            toast.success(`Status updated for ${selectedVehicles.length} vehicles`);
            setBulkStatusModalOpen(false);
            setSelectedVehicles([]);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Bulk update failed');
        }
    };

    const handleSaveType = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await createTypeMutation.mutateAsync(typeForm);
                toast.success('Vehicle type created successfully');
            } else {
                await updateTypeMutation.mutateAsync({
                    id: selectedType.id,
                    data: typeForm
                });
                toast.success('Vehicle type updated successfully');
            }
            setTypeModalOpen(false);
            setSelectedType(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDeleteType = async () => {
        try {
            await deleteTypeMutation.mutateAsync(selectedType.id);
            toast.success('Vehicle type deleted successfully');
            setDeleteTypeModalOpen(false);
            setSelectedType(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const getVehicleIcon = (typeName) => {
        const IconComponent = typeName?.toLowerCase() === 'bus' ? Bus :
            typeName?.toLowerCase() === 'truck' ? Truck : Car;
        return IconComponent;
    };

    const getVehicleColor = (typeName) => {
        switch (typeName?.toLowerCase()) {
            case 'bus': return 'blue';
            case 'truck': return 'gray';
            default: return 'yellow';
        }
    };

    const checkDocumentStatus = (expiryDate) => {
        if (!expiryDate) return 'missing';
        const expiry = new Date(expiryDate);
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        if (expiry < today) return 'expired';
        if (expiry < thirtyDaysFromNow) return 'expiring';
        return 'valid';
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeSection="vehicles"
                onNavigate={() => { }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 flex-shrink-0">
                    <div className="px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                >
                                    <Menu size={20} />
                                </button>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Vehicle Management</h1>
                                    <p className="text-sm text-gray-500 mt-1">Manage vehicles, types, and documentation</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Centered Tabs */}
                            <div className="flex justify-center mb-6">
                                <div className="bg-gray-100 p-1.5 rounded-xl inline-flex shadow-inner">
                                    <button
                                        onClick={() => setActiveTab('vehicles')}
                                        className={`px-6 sm:px-8 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${activeTab === 'vehicles'
                                                ? 'bg-white text-emerald-600 shadow-md'
                                                : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        <Car size={18} />
                                        <span className="hidden sm:inline">Vehicles</span>
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === 'vehicles'
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {stats.totalVehicles || 0}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('types')}
                                        className={`px-6 sm:px-8 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${activeTab === 'types'
                                                ? 'bg-white text-emerald-600 shadow-md'
                                                : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        <Layers size={18} />
                                        <span className="hidden sm:inline">Vehicle Types</span>
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === 'types'
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {typeStatsData.totalTypes || 0}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'vehicles' ? (
                                <>
                                    {/* Alert Banner */}
                                    {(stats.expiredInsurance > 0 || stats.expiredInspection > 0) && (
                                        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                                            <div className="flex items-start">
                                                <AlertTriangle className="text-amber-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-amber-800">Attention Required</h3>
                                                    <p className="text-sm text-amber-700 mt-1">
                                                        {stats.expiredInsurance > 0 && `${stats.expiredInsurance} vehicles have expired insurance`}
                                                        {stats.expiredInsurance > 0 && stats.expiredInspection > 0 && ' • '}
                                                        {stats.expiredInspection > 0 && `${stats.expiredInspection} vehicles have expired inspection`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Statistics Cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                                                    <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">{stats.totalVehicles || 0}</p>
                                                </div>
                                                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                                                    <Car size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Active</p>
                                                    <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">{stats.activeVehicles || 0}</p>
                                                </div>
                                                <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                                                    <CheckCircle size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Verified</p>
                                                    <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">{stats.verifiedPhotos || 0}</p>
                                                </div>
                                                <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                                                    <Camera size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Exp. Ins.</p>
                                                    <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">{stats.expiredInsurance || 0}</p>
                                                </div>
                                                <div className="bg-amber-50 text-amber-600 p-2 rounded-lg">
                                                    <FileWarning size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Exp. Insp.</p>
                                                    <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">{stats.expiredInspection || 0}</p>
                                                </div>
                                                <div className="bg-orange-50 text-orange-600 p-2 rounded-lg">
                                                    <ClipboardCheck size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Filters and Bulk Actions */}
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1 flex flex-wrap gap-2">
                                                <div className="relative flex-1 min-w-[200px]">
                                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                                    <input
                                                        type="text"
                                                        placeholder="Search vehicles..."
                                                        value={vehicleFilters.search}
                                                        onChange={(e) => handleVehicleFilterChange('search', e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                                    />
                                                </div>
                                                <select
                                                    value={vehicleFilters.status}
                                                    onChange={(e) => handleVehicleFilterChange('status', e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                                >
                                                    <option value="">All Status</option>
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                                <select
                                                    value={vehicleFilters.vehicleTypeId}
                                                    onChange={(e) => handleVehicleFilterChange('vehicleTypeId', e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                                >
                                                    <option value="">All Types</option>
                                                    {types.map(type => (
                                                        <option key={type.id} value={type.id}>{type.typeName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {selectedVehicles.length > 0 && (
                                                <button
                                                    onClick={() => setBulkStatusModalOpen(true)}
                                                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm flex items-center space-x-2"
                                                >
                                                    <Edit size={16} />
                                                    <span>Update Status ({selectedVehicles.length})</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Vehicles Table */}
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left">
                                                            <input
                                                                type="checkbox"
                                                                onChange={handleSelectAll}
                                                                checked={selectedVehicles.length === vehicles.length && vehicles.length > 0}
                                                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                            />
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Info</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Owner/Driver</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {vehiclesLoading ? (
                                                        <tr>
                                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                                Loading vehicles...
                                                            </td>
                                                        </tr>
                                                    ) : vehicles.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                                No vehicles found
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        vehicles.map((vehicle) => {
                                                            const VehicleIcon = getVehicleIcon(vehicle.vehicleType?.typeName);
                                                            const color = getVehicleColor(vehicle.vehicleType?.typeName);

                                                            return (
                                                                <tr key={vehicle.id} className="hover:bg-gray-50">
                                                                    <td className="px-6 py-4">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedVehicles.includes(vehicle.id)}
                                                                            onChange={() => handleSelectVehicle(vehicle.id)}
                                                                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                                                        />
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="flex items-center">
                                                                            <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                                                                                <VehicleIcon className={`w-5 h-5 text-${color}-600`} />
                                                                            </div>
                                                                            <div className="ml-4">
                                                                                <div className="text-sm font-medium text-gray-900">{vehicle.licensePlate}</div>
                                                                                <div className="text-sm text-gray-500">{vehicle.make} {vehicle.model}</div>
                                                                                <div className="text-xs text-gray-400">{vehicle.year}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
                                                                            {vehicle.vehicleType?.typeName}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                                                        {vehicle.ownerDriver && (
                                                                            <div>
                                                                                <div className="text-sm text-gray-900">
                                                                                    {vehicle.ownerDriver.firstName} {vehicle.ownerDriver.lastName}
                                                                                </div>
                                                                                <div className="text-sm text-gray-500">{vehicle.ownerDriver.phoneNumber}</div>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <select
                                                                            value={vehicle.status}
                                                                            onChange={(e) => {
                                                                                setSelectedVehicle(vehicle);
                                                                                setVehicleStatus(e.target.value);
                                                                                handleUpdateVehicleStatus();
                                                                            }}
                                                                            className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:ring-2 focus:ring-emerald-500 ${vehicle.status === 'active'
                                                                                    ? 'bg-green-100 text-green-800'
                                                                                    : 'bg-red-100 text-red-800'
                                                                                }`}
                                                                        >
                                                                            <option value="active">Active</option>
                                                                            <option value="inactive">Inactive</option>
                                                                        </select>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                        <button
                                                                            onClick={() => openViewModal(vehicle)}
                                                                            className="text-emerald-600 hover:text-emerald-900"
                                                                            title="View details"
                                                                        >
                                                                            <Eye size={18} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                            <div className="text-sm text-gray-700">
                                                Showing {((vehiclePagination.page - 1) * vehiclePagination.limit) + 1} to{' '}
                                                {Math.min(vehiclePagination.page * vehiclePagination.limit, vehiclePagination.total)} of{' '}
                                                {vehiclePagination.total} results                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleVehicleFilterChange('page', Math.max(vehicleFilters.page - 1, 1))}
                                                    disabled={vehicleFilters.page === 1}
                                                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleVehicleFilterChange('page', Math.min(vehicleFilters.page + 1, vehiclePagination.totalPages))}
                                                    disabled={vehicleFilters.page === vehiclePagination.totalPages}
                                                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // Vehicle Types Section
                                <>
                                    <div className="mb-4 flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-gray-900">Vehicle Types</h2>
                                        <button
                                            onClick={openAddTypeModal}
                                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center space-x-2"
                                        >
                                            <Plus size={16} />
                                            <span>Add Vehicle Type</span>
                                        </button>
                                    </div>

                                    {/* Vehicle Types Table */}
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left">Type Name</th>
                                                        <th className="px-6 py-3 text-left">Description</th>
                                                        <th className="px-6 py-3 text-left">Max Passengers</th>
                                                        <th className="px-6 py-3 text-left">Requires Helmet</th>
                                                        <th className="px-6 py-3 text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {typesLoading ? (
                                                        <tr>
                                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                                Loading vehicle types...
                                                            </td>
                                                        </tr>
                                                    ) : types.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                                No vehicle types found
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        types.map((type) => (
                                                            <tr key={type.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4">{type.typeName}</td>
                                                                <td className="px-6 py-4">{type.description}</td>
                                                                <td className="px-6 py-4">{type.maxPassengers}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${type.requiresHelmet ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                        {type.requiresHelmet ? 'Yes' : 'No'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <button
                                                                        onClick={() => openEditTypeModal(type)}
                                                                        className="text-blue-600 hover:text-blue-900"
                                                                        title="Edit type"
                                                                    >
                                                                        <Edit size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => openDeleteTypeModal(type)}
                                                                        className="text-red-600 hover:text-red-900 ml-2"
                                                                        title="Delete type"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Update Modal */}
            <AnimatePresence>
                {statusModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900">Update Vehicle Status</h3>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={vehicleStatus}
                                    onChange={(e) => setVehicleStatus(e.target.value)}
                                    className="block w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setStatusModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateVehicleStatus}
                                    className="ml-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bulk Status Update Modal */}
            <AnimatePresence>
                {bulkStatusModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900">Bulk Update Vehicle Status</h3>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={bulkStatus}
                                    onChange={(e) => setBulkStatus(e.target.value)}
                                    className="block w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setBulkStatusModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkStatusUpdate}
                                    className="ml-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Vehicle Type Modal */}
            <AnimatePresence>
                {typeModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900">{modalMode === 'add' ? 'Add Vehicle Type' : 'Edit Vehicle Type'}</h3>
                            <form onSubmit={handleSaveType} className="mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type Name</label>
                                    <input
                                        type="text"
                                        value={typeForm.typeName}
                                        onChange={(e) => setTypeForm({ ...typeForm, typeName: e.target.value })}
                                        required
                                        className="block w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={typeForm.description}
                                        onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
                                        required
                                        className="block w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Passengers</label>
                                    <input
                                        type="number"
                                        value={typeForm.maxPassengers}
                                        onChange={(e) => setTypeForm({ ...typeForm, maxPassengers: e.target.value })}
                                        required
                                        className="block w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="mt-4 flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={typeForm.requiresHelmet}
                                        onChange={(e) => setTypeForm({ ...typeForm, requiresHelmet: e.target.checked })}
                                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                    />
                                    <label className="ml-2 block text-sm text-gray-900">Requires Helmet</label>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() => setTypeModalOpen(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="ml-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                                    >
                                        {modalMode === 'add' ? 'Add Type' : 'Update Type'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Type Modal */}
            <AnimatePresence>
                {deleteTypeModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                            <div className="mt-4">
                                <p className="text-sm text-gray-700">Are you sure you want to delete the vehicle type <strong>{selectedType?.typeName}</strong>? This action cannot be undone.</p>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setDeleteTypeModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteType}
                                    className="ml-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VehicleManagement;

