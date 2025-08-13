// src/components/GeographyManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin,
    Building,
    Plus,
    Edit,
    Eye,
    Trash2,
    X,
    Menu,
    ChevronLeft,
    ChevronRight,
    Search,
    Download,
    Star,
    AlertTriangle,
    XCircle,
    BarChart2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import {
    useRegions,
    useRegion,
    useCreateRegion,
    useUpdateRegion,
    useDeleteRegion,
    useCities,
    useCity,
    useCreateCity,
    useUpdateCity,
    useDeleteCity,
    useGeographyStats
} from '../hook/geographyHook';

const GeographyManagement = () => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const [activeTab, setActiveTab] = useState('regions');

    // Filter states for regions
    const [regionFilters, setRegionFilters] = useState({
        name: '',
        code: '',
        page: 1,
        limit: 10
    });

    // Filter states for cities
    const [cityFilters, setCityFilters] = useState({
        name: '',
        regionId: '',
        isMajorCity: '',
        page: 1,
        limit: 10
    });

    // Modal states
    const [regionModalOpen, setRegionModalOpen] = useState(false);
    const [cityModalOpen, setCityModalOpen] = useState(false);
    const [viewRegionModalOpen, setViewRegionModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);

    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [modalMode, setModalMode] = useState('add');
    const [deleteItem, setDeleteItem] = useState({ type: null, item: null });
    const [errorMessage, setErrorMessage] = useState('');

    // Form states
    const [regionForm, setRegionForm] = useState({
        name: '',
        code: '',
        capitalCity: ''
    });

    const [cityForm, setCityForm] = useState({
        name: '',
        regionId: '',
        isMajorCity: false
    });

    // Clean filters for API
    const cleanRegionFilters = useMemo(() => {
        const cleaned = { page: regionFilters.page, limit: regionFilters.limit };
        if (regionFilters.name) cleaned.name = regionFilters.name;
        if (regionFilters.code) cleaned.code = regionFilters.code;
        return cleaned;
    }, [regionFilters]);

    const cleanCityFilters = useMemo(() => {
        const cleaned = { page: cityFilters.page, limit: cityFilters.limit };
        if (cityFilters.name) cleaned.name = cityFilters.name;
        if (cityFilters.regionId) cleaned.regionId = cityFilters.regionId;
        if (cityFilters.isMajorCity !== '') {
            cleaned.isMajorCity = cityFilters.isMajorCity === 'true';
        }
        return cleaned;
    }, [cityFilters]);

    // API Hooks
    const { data: regionsData, isLoading: regionsLoading } = useRegions(cleanRegionFilters);
    const { data: citiesData, isLoading: citiesLoading } = useCities(cleanCityFilters);
    const { data: stats } = useGeographyStats();
    const { data: selectedRegionData } = useRegion(selectedRegion?.id);
    const { data: selectedCityData } = useCity(selectedCity?.id);

    // All regions for dropdown (without pagination)
    const { data: allRegionsData } = useRegions({ limit: 100 });

    // Mutations
    const createRegionMutation = useCreateRegion();
    const updateRegionMutation = useUpdateRegion();
    const deleteRegionMutation = useDeleteRegion();
    const createCityMutation = useCreateCity();
    const updateCityMutation = useUpdateCity();
    const deleteCityMutation = useDeleteCity();

    // Data
    const regions = useMemo(() => regionsData?.data?.items || [], [regionsData]);
    const regionPagination = useMemo(() => regionsData?.data?.pagination || {}, [regionsData]);
    const cities = useMemo(() => citiesData?.data?.items || [], [citiesData]);
    const cityPagination = useMemo(() => citiesData?.data?.pagination || {}, [citiesData]);
    const allRegions = useMemo(() => allRegionsData?.data?.items || [], [allRegionsData]);
    const geographyStats = stats?.data || {};

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
        if (modalMode === 'edit' && selectedRegion && selectedRegionData?.data) {
            const region = selectedRegionData.data;
            setRegionForm({
                name: region.name || '',
                code: region.code || '',
                capitalCity: region.capitalCity || ''
            });
        }
    }, [modalMode, selectedRegion, selectedRegionData]);

    useEffect(() => {
        if (modalMode === 'edit' && selectedCity && selectedCityData?.data) {
            const city = selectedCityData.data;
            setCityForm({
                name: city.name || '',
                regionId: city.regionId || '',
                isMajorCity: city.isMajorCity || false
            });
        }
    }, [modalMode, selectedCity, selectedCityData]);

    // Handlers
    const handleRegionFilterChange = (key, value) => {
        setRegionFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handleCityFilterChange = (key, value) => {
        setCityFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const openAddRegionModal = () => {
        setModalMode('add');
        setSelectedRegion(null);
        setRegionForm({ name: '', code: '', capitalCity: '' });
        setRegionModalOpen(true);
    };

    const openEditRegionModal = (region) => {
        setModalMode('edit');
        setSelectedRegion(region);
        setRegionModalOpen(true);
    };

    const openAddCityModal = () => {
        setModalMode('add');
        setSelectedCity(null);
        setCityForm({ name: '', regionId: '', isMajorCity: false });
        setCityModalOpen(true);
    };

    const openEditCityModal = (city) => {
        setModalMode('edit');
        setSelectedCity(city);
        setCityModalOpen(true);
    };

    const openViewRegion = (region) => {
        setSelectedRegion(region);
        setViewRegionModalOpen(true);
    };

    const openDeleteModal = (type, item) => {
        // Check if region has cities
        if (type === 'region' && item.cityCount > 0) {
            setErrorMessage(`Cannot delete region "${item.name}" because it has ${item.cityCount} cities associated with it. Please delete or reassign all cities first.`);
            setErrorModalOpen(true);
            return;
        }

        setDeleteItem({ type, item });
        setDeleteModalOpen(true);
    };

    const handleSaveRegion = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await createRegionMutation.mutateAsync(regionForm);
                toast.success('Region created successfully');
            } else {
                await updateRegionMutation.mutateAsync({
                    id: selectedRegion.id,
                    data: regionForm
                });
                toast.success('Region updated successfully');
            }
            setRegionModalOpen(false);
            setSelectedRegion(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleSaveCity = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await createCityMutation.mutateAsync(cityForm);
                toast.success('City created successfully');
            } else {
                await updateCityMutation.mutateAsync({
                    id: selectedCity.id,
                    data: cityForm
                });
                toast.success('City updated successfully');
            }
            setCityModalOpen(false);
            setSelectedCity(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async () => {
        try {
            if (deleteItem.type === 'region') {
                await deleteRegionMutation.mutateAsync(deleteItem.item.id);
                toast.success('Region deleted successfully');
            } else {
                await deleteCityMutation.mutateAsync(deleteItem.item.id);
                toast.success('City deleted successfully');
            }
            setDeleteModalOpen(false);
            setDeleteItem({ type: null, item: null });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    const exportData = () => {
        const data = activeTab === 'regions' ? regions : cities;
        const headers = activeTab === 'regions'
            ? ['Name', 'Code', 'Capital City', 'City Count']
            : ['Name', 'Region', 'Region Code', 'Is Major City'];

        let csv = headers.join(',') + '\n';

        data.forEach(item => {
            if (activeTab === 'regions') {
                csv += `"${item.name}","${item.code}","${item.capitalCity}",${item.cityCount}\n`;
            } else {
                csv += `"${item.name}","${item.regionName}","${item.regionCode}",${item.isMajorCity}\n`;
            }
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success(`Exported ${data.length} ${activeTab} successfully`);
    };

    // Pagination component
    const PaginationControls = ({ pagination, onPageChange }) => {
        const { page, totalPages, hasNext, hasPrev, total, limit } = pagination;
        const startItem = (page - 1) * limit + 1;
        const endItem = Math.min(page * limit, total);

        // Generate page numbers to display
        const getPageNumbers = () => {
            const pages = [];
            const maxVisible = 5;

            if (totalPages <= maxVisible) {
                for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                if (page <= 3) {
                    for (let i = 1; i <= 4; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                } else if (page >= totalPages - 2) {
                    pages.push(1);
                    pages.push('...');
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                        pages.push(i);
                    }
                } else {
                    pages.push(1);
                    pages.push('...');
                    for (let i = page - 1; i <= page + 1; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                }
            }

            return pages;
        };

        return (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                    Showing {startItem}-{endItem} of {total} results
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => onPageChange(page - 1)}
                        disabled={!hasPrev}
                        className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {getPageNumbers().map((pageNum, index) => (
                        pageNum === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-2">...</span>
                        ) : (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                className={`px-3 py-1 rounded-md ${page === pageNum
                                        ? 'bg-emerald-500 text-white'
                                        : 'border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {pageNum}
                            </button>
                        )
                    ))}

                    <button
                        onClick={() => onPageChange(page + 1)}
                        disabled={!hasNext}
                        className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeSection="geography"
                onNavigate={() => { }}
            />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-                200 flex-shrink-0">
                    <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                                <Menu size={20} />
                            </button>
                            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Geography Management</h1>
                        </div>
                        <button onClick={exportData} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                            <Download size={16} />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 overflow-auto">
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Regions</p>
                                            <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">{geographyStats.totalRegions || 0}</p>
                                        </div>
                                        <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                                            <MapPin size={20} />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Cities</p>
                                            <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">{geographyStats.totalCities || 0}</p>
                                        </div>
                                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                                            <Building size={20} />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs sm:text-sm font-medium text-gray-600">Major Cities</p>
                                            <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">{geographyStats.majorCities || 0}</p>
                                        </div>
                                        <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                                            <Star size={20} />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Cities/Region</p>
                                            <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">
                                                {geographyStats?.totalRegions && geographyStats?.totalCities
                                                    ? (geographyStats.totalCities / geographyStats.totalRegions).toFixed(1)
                                                    : '0.0'}
                                            </p>
                                        </div>
                                        <div className="bg-orange-50 text-orange-600 p-2 rounded-lg">
                                            <BarChart2 size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex justify-center mb-6">
                                <div className="bg-gray-100 p-1.5 rounded-xl inline-flex shadow-inner">
                                    <button onClick={() => setActiveTab('regions')} className={`px-6 sm:px-8 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${activeTab === 'regions' ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-600 hover:text-gray-800'}`}>
                                        <MapPin size={16} />
                                        <span className="hidden sm:inline">Regions</span>
                                    </button>
                                    <button onClick={() => setActiveTab('cities')} className={`px-6 sm:px-8 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${activeTab === 'cities' ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-600 hover:text-gray-800'}`}>
                                        <Building size={16} />
                                        <span className="hidden sm:inline">Cities</span>
                                    </button>
                                </div>
                            </div>

                            {/* Regions Tab Content */}
                            {activeTab === 'regions' && (
                                <div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-gray-900">Regions</h2>
                                        <button onClick={openAddRegionModal} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center space-x-2">
                                            <Plus size={16} />
                                            <span>Add Region</span>
                                        </button>
                                    </div>

                                    {/* Region Filters */}
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search regions..."
                                                        value={regionFilters.name}
                                                        onChange={(e) => handleRegionFilterChange('name', e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Region Code"
                                                        value={regionFilters.code}
                                                        onChange={(e) => handleRegionFilterChange('code', e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Regions Table */}
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capital City</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cities</th>
                                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {regionsLoading ? (
                                                        <tr>
                                                            <td colSpan="5" className="text-center py-4">Loading...</td>
                                                        </tr>
                                                    ) : (
                                                        regions.map(region => (
                                                            <tr key={region.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap">{region.name}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap">{region.code}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap">{region.capitalCity}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap">{region.cityCount} cities</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                    <button onClick={() => openViewRegion(region)} className="text-emerald-600 hover:text-emerald-900" title="View details">
                                                                        <Eye size={16} />
                                                                    </button>
                                                                    <button onClick={() => openEditRegionModal(region)} className="text-blue-600 hover:text-blue-900 ml-2" title="Edit region">
                                                                        <Edit size={16} />
                                                                    </button>
                                                                    <button onClick={() => openDeleteModal('region', region)} className="text-red-600 hover:text-red-900 ml-2" title="Delete region">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Pagination */}
                                    <PaginationControls pagination={regionPagination} onPageChange={(page) => handleRegionFilterChange('page', page)} />
                                </div>
                            )}

                            {/* Cities Tab Content */}
                            {activeTab === 'cities' && (
                                <div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-gray-900">Cities</h2>
                                        <button onClick={openAddCityModal} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center space-x-2">
                                            <Plus size={16} />
                                            <span>Add City</span>
                                        </button>
                                    </div>

                                    {/* City Filters */}
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search cities..."
                                                        value={cityFilters.name}
                                                        onChange={(e) => handleCityFilterChange('name', e.target.value)}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <select
                                                    value={cityFilters.regionId}
                                                    onChange={(e) => handleCityFilterChange('regionId', e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                                >
                                                    <option value="">All Regions</option>
                                                    {allRegions.map(region => (
                                                        <option key={region.id} value={region.id}>{region.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <select
                                                    value={cityFilters.isMajorCity}
                                                    onChange={(e) => handleCityFilterChange('isMajorCity', e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                                                >
                                                    <option value="">All Cities</option>
                                                    <option value="true">Major Cities Only</option>
                                                    <option value="false">Regular Cities Only</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cities Table */}
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {citiesLoading ? (
                                                        <tr>
                                                            <td colSpan="4" className="text-center py-4">Loading...</td>
                                                        </tr>
                                                    ) : (
                                                        cities.map(city => (
                                                            <tr key={city.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap">{city.name}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap">{city.regionName}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${city.isMajorCity ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                        {city.isMajorCity ? 'Major City' : 'Regular City'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                    <button onClick={() => openEditCityModal(city)} className="text-blue-600 hover:text-blue-900" title="Edit city">
                                                                        <Edit size={16} />
                                                                    </button>
                                                                    <button onClick={() => openDeleteModal('city', city)} className="text-red-600 hover:text-red-900 ml-2" title="Delete city">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Pagination */}
                                    <PaginationControls pagination={cityPagination} onPageChange={(page) => handleCityFilterChange('page', page)} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {regionModalOpen && (
                    <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex items-center justify-center min-h-screen p-4">
                            <motion.div className="bg-white rounded-lg shadow-xl max-w-md w-full" initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }}>
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">{modalMode === 'add' ? 'Add New Region' : 'Edit Region'}</h3>
                                    <button onClick={() => setRegionModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <form onSubmit={handleSaveRegion} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Region Name *</label>
                                            <input type="text" value={regionForm.name} onChange={(e) => setRegionForm({ ...regionForm, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Region Code *</label>
                                            <input type="text" value={regionForm.code} onChange={(e) => setRegionForm({ ...regionForm, code: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Capital City *</label>
                                            <input type="text" value={regionForm.capitalCity} onChange={(e) => setRegionForm({ ...regionForm, capitalCity: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <button type="button" onClick={() => setRegionModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                            <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">{modalMode === 'add' ? 'Add Region' : 'Update Region'}</button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {cityModalOpen && (
                    <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex items-center justify-center min-h-screen p-4">
                            <motion.div className="bg-white rounded-lg shadow-xl max-w-md w-full" initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }}>
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">{modalMode === 'add' ? 'Add New City' : 'Edit City'}</h3>
                                    <button onClick={() => setCityModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <form onSubmit={handleSaveCity} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City Name *</label>
                                            <input type="text" value={cityForm.name} onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
                                            <select value={cityForm.regionId} onChange={(e) => setCityForm({ ...cityForm, regionId: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                                <option value="">Select Region</option>
                                                {allRegions.map(region => (
                                                    <option key={region.id} value={region.id}>{region.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center">
                                            <input type="checkbox" checked={cityForm.isMajorCity} onChange={(e) => setCityForm({ ...cityForm, isMajorCity: e.target.checked })} className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded" />
                                            <label className="ml-2 block text-sm text-gray-900">Major City (Regional Capital)</label>
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <button type="button" onClick={() => setCityModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                            <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">{modalMode === 'add' ? 'Add City' : 'Update City'}</button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {viewRegionModalOpen && (
                    <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex items-center justify-center min-h-screen p-4">
                            <motion.div className="bg-white rounded-lg shadow-xl max-w-2xl w-full" initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }}>
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Region Details</h3>
                                    <button onClick={() => setViewRegionModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                                    {selectedRegion && (
                                        <div className="space-y-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <MapPin size={32} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-bold text-gray-900">{selectedRegion.name}</h4>
                                                    <p className="text-gray-600">Region Code: {selectedRegion.code}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Region Information</h5>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                                            <span className="text-sm text-gray-600">Code</span>
                                                            <span className="text-sm font-medium text-gray-900">{selectedRegion.code}</span>
                                                        </div>
                                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                                            <span className="text-sm text-gray-600">Capital City</span>
                                                            <span className="text-sm font-medium text-gray-900">{selectedRegion.capitalCity}</span>
                                                        </div>
                                                        <div className="flex justify-between py-1 border-b border-gray-100">
                                                            <span className="text-sm text-gray-600">Total Cities</span>
                                                            <span className="text-sm font-medium text-gray-900">{selectedRegion.cityCount}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Cities in {selectedRegion.name}</h5>
                                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                                        {cities.filter(city => city.regionId === selectedRegion.id).map(city => (
                                                            <div key={city.id} className="flex items-center justify-between py-1">
                                                                <span className="text-sm text-gray-700">{city.name}</span>
                                                                {city.isMajorCity && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Major</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                                    <button onClick={() => setViewRegionModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {deleteModalOpen && (
                    <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex items-center justify-center min-h-screen p-4">
                            <motion.div className="bg-white rounded-lg shadow-xl max-w-md w-full" initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }}>
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-red-100 rounded-full p-3 mr-4">
                                            <AlertTriangle size={32} className="text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-900">Are you sure you want to delete this {deleteItem.type === 'region' ? 'region' : 'city'}?</p>
                                            <p className="text-xs text-gray-500 mt-1">This action cannot be undone.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                                    <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                    <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {errorModalOpen && (
                    <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex items-center justify-center min-h-screen p-4">
                            <motion.div className="bg-white rounded-lg shadow-xl max-w-md w-full" initial={{ y: -50 }} animate={{ y: 0 }} exit={{ y: -50 }}>
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">Error</h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center">
                                        <div className="bg-red-100 rounded-full p-3 mr-4">
                                            <XCircle size={32} className="text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-900">{errorMessage}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                                    <button onClick={() => setErrorModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GeographyManagement;
