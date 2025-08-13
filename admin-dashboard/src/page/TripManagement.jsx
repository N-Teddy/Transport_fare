import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Route,
    Eye,
    Map,
    Filter,
    Download,
    Search,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    X,
    Navigation,
    MapPin,
    DollarSign,
    BarChart3,
    Info,
    User,
    Calendar,
    Clock,
    TrendingUp,
    AlertCircle,
    Menu,
    MoreVertical
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useTrips, useTrip, useGpsLogs, useTripStats } from '../hook/tripHook';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import Sidebar from '../components/Sidebar';

// Import the marker images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom map icons
const createCustomIcon = (color, type = 'default') => {
    const iconHtml = type === 'start'
        ? `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`
        : `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`;

    return L.divIcon({
        html: iconHtml,
        iconSize: [24, 24],
        className: 'custom-marker'
    });
};

// Route Map Component
const RouteMap = React.memo(({ trip, gpsLogs, expanded = false }) => {
    const MapController = () => {
        const map = useMap();

        useEffect(() => {
            if (trip && trip.startLatitude && trip.startLongitude) {
                const bounds = L.latLngBounds([
                    [parseFloat(trip.startLatitude), parseFloat(trip.startLongitude)],
                    [parseFloat(trip.endLatitude), parseFloat(trip.endLongitude)]
                ]);

                if (trip.startLatitude === trip.endLatitude && trip.startLongitude === trip.endLongitude) {
                    map.setView([parseFloat(trip.startLatitude), parseFloat(trip.startLongitude)], 15);
                } else {
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            }
        }, [trip, map]);

        return null;
    };

    const routeCoordinates = useMemo(() => {
        if (gpsLogs && gpsLogs.length > 0) {
            return gpsLogs.map(log => [log.latitude, log.longitude]);
        } else if (trip) {
            const start = [parseFloat(trip.startLatitude), parseFloat(trip.startLongitude)];
            const end = [parseFloat(trip.endLatitude), parseFloat(trip.endLongitude)];

            if (start[0] === end[0] && start[1] === end[1]) {
                return [
                    start,
                    [start[0] + 0.001, start[1] + 0.001],
                    [start[0] + 0.002, start[1]],
                    [start[0] + 0.001, start[1] - 0.001],
                    start
                ];
            }
            return [start, end];
        }
        return [];
    }, [trip, gpsLogs]);

    if (!trip) return null;

    return (
        <MapContainer
            center={[parseFloat(trip.startLatitude), parseFloat(trip.startLongitude)]}
            zoom={13}
            style={{ height: expanded ? '70vh' : '280px', width: '100%' }}
            className="rounded-lg z-0"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <MapController />

            <Marker
                position={[parseFloat(trip.startLatitude), parseFloat(trip.startLongitude)]}
                icon={createCustomIcon('#10b981', 'start')}
            >
                <Popup>
                    <div>
                        <strong>Start Location</strong>
                        <br />
                        Time: {format(new Date(trip.startTime), 'HH:mm:ss')}
                    </div>
                </Popup>
            </Marker>

            {(trip.startLatitude !== trip.endLatitude || trip.startLongitude !== trip.endLongitude) && (
                <Marker
                    position={[parseFloat(trip.endLatitude), parseFloat(trip.endLongitude)]}
                    icon={createCustomIcon('#ef4444', 'end')}
                >
                    <Popup>
                        <div>
                            <strong>End Location</strong>
                            <br />
                            Time: {format(new Date(trip.endTime), 'HH:mm:ss')}
                        </div>
                    </Popup>
                </Marker>
            )}

            {routeCoordinates.length > 0 && (
                <Polyline
                    positions={routeCoordinates}
                    color="#10b981"
                    weight={4}
                    opacity={0.7}
                />
            )}
        </MapContainer>
    );
});

const TripManagement = () => {
    const queryClient = useQueryClient();

    // State management
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const [activeSection, setActiveSection] = useState('trips');
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        paymentMethod: 'all',
        startDate: null,
        endDate: null,
        page: 0,
        limit: 10
    });
    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    // API hooks
    const { data: tripsData, isLoading: tripsLoading, refetch: refetchTrips } = useTrips(filters);
    const { data: selectedTripData } = useTrip(selectedTrip?.id);
    const { data: gpsLogs } = useGpsLogs(selectedTrip?.id);
    const { data: tripStats, refetch: refetchStats } = useTripStats();

    // Auto-refresh stats every 5 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            refetchStats();
            refetchTrips();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [refetchStats, refetchTrips]);

    // Handle responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Memoized calculations
    const trips = useMemo(() => tripsData?.data?.items || [], [tripsData]);
    const totalTrips = useMemo(() => tripsData?.data?.total || 0, [tripsData]);

    // Handlers
    const handleTripSelect = useCallback((trip) => {
        setSelectedTrip(trip);
    }, []);

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
    }, []);

    const handlePageChange = useCallback((page) => {
        setFilters(prev => ({ ...prev, page }));
    }, []);

    const getStatusColor = (status) => {
        const colors = {
            completed: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            failed: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatCurrency = (amount) => {
        return `₣${amount.toLocaleString()}`;
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeSection={activeSection}
                onNavigate={setActiveSection}
            />

            {/* Main Content Area */}
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
                                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Trip Management</h1>
                                    <p className="text-sm text-gray-500 mt-1">Monitor and manage all trip activities</p>
                                </div>
                            </div>
                            <button className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <Download size={16} />
                                <span className="text-sm font-medium">Export</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 overflow-auto">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                                {
                                    title: 'Total Trips',
                                    value: tripStats?.totalTrips || 0,
                                    change: '+12% from last week',
                                    icon: Route,
                                    iconBg: 'bg-emerald-50',
                                    iconColor: 'text-emerald-600'
                                },
                                {
                                    title: 'Total Revenue',
                                    value: formatCurrency(tripStats?.totalRevenue || 0),
                                    change: '+8% from last week',
                                    icon: DollarSign,
                                    iconBg: 'bg-blue-50',
                                    iconColor: 'text-blue-600'
                                },
                                {
                                    title: 'Active Trips',
                                    value: 3,
                                    change: 'Live now',
                                    icon: Navigation,
                                    iconBg: 'bg-green-50',
                                    iconColor: 'text-green-600',
                                    pulse: true
                                },
                                {
                                    title: 'Avg. Distance',
                                    value: '12.5 km',
                                    change: 'Per trip',
                                    icon: MapPin,
                                    iconBg: 'bg-purple-50',
                                    iconColor: 'text-purple-600'
                                }
                            ].map((stat, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                            <p className="text-2xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                                            <div className="flex items-center mt-2">
                                                {stat.pulse && (
                                                    <span className="flex h-2 w-2 mr-2">
                                                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                    </span>
                                                )}
                                                <p className="text-xs text-gray-500">{stat.change}</p>
                                            </div>
                                        </div>
                                        <div className={`${stat.iconBg} ${stat.iconColor} p-3 rounded-lg`}>
                                            <stat.icon size={20} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                            <div className="flex flex-wrap gap-3">
                                <div className="flex-1 min-w-[200px]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search by trip ID, driver, or vehicle..."
                                            value={filters.search}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                                >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                </select>

                                <select
                                    value={filters.paymentMethod}
                                    onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                                >
                                    <option value="all">All Payments</option>
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="mobile">Mobile Money</option>
                                </select>

                                <input
                                    type="date"
                                    value={filters.startDate || ''}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />

                                <button className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2">
                                    <Filter size={16} />
                                    <span>Apply</span>
                                </button>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            {/* Trips Table - Takes 2 columns on xl screens */}
                            <div className="xl:col-span-2">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-gray-900">Recent Trips</h2>
                                        <span className="text-sm text-gray-500">{totalTrips} total trips</span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Trip Info
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Driver/Vehicle
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Duration
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Fare
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {tripsLoading ? (
                                                    [...Array(5)].map((_, index) => (
                                                        <tr key={index}>
                                                            <td colSpan="6" className="px-6 py-4">
                                                                <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : trips.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                            <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                                                            <p>No trips found</p>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    trips.map((trip) => (
                                                        <tr
                                                            key={trip.id}
                                                            onClick={() => handleTripSelect(trip)}
                                                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedTrip?.id === trip.id ? 'bg-emerald-50' : ''
                                                                }`}
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        #{trip.id.substring(0, 8)}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {format(new Date(trip.createdAt), 'MMM dd, HH:mm')}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className="text-sm text-gray-900">
                                                                        D-{trip.driverId.substring(0, 6)}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        V-{trip.vehicleId.substring(0, 6)}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {trip.durationMinutes || 0} min
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {formatCurrency(trip.totalFare)}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {trip.paymentMethod}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex flex-col space-y-1">
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trip.paymentStatus)}`}>
                                                                        {trip.paymentStatus}
                                                                    </span>
                                                                    {trip.syncStatus === 'pending' && (
                                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                                                            Pending Sync
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                                <div className="flex items-center justify-center space-x-2">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedTrip(trip);
                                                                            setDetailsModalOpen(true);
                                                                        }}
                                                                        className="text-emerald-600 hover:text-emerald-900 p-1"
                                                                    >
                                                                        <Eye size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedTrip(trip);
                                                                            setMapModalOpen(true);
                                                                        }}
                                                                        className="text-blue-600 hover:text-blue-900 p-1"
                                                                    >
                                                                        <Map size={18} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {trips.length > 0 && (
                                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                            <div className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{filters.page * filters.limit + 1}</span> to{' '}
                                                <span className="font-medium">
                                                    {Math.min((filters.page + 1) * filters.limit, totalTrips)}
                                                </span>{' '}
                                                of <span className="font-medium">{totalTrips}</span> results
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handlePageChange(filters.page - 1)}
                                                    disabled={filters.page === 0}
                                                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                                {[...Array(Math.ceil(totalTrips / filters.limit))].slice(0, 5).map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handlePageChange(index)}
                                                        className={`px-3 py-1 rounded-md ${filters.page === index
                                                                ? 'bg-emerald-500 text-white'
                                                                : 'border border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                ))}
                                                <button
                                                    onClick={() => handlePageChange(filters.page + 1)}
                                                    disabled={(filters.page + 1) * filters.limit >= totalTrips}
                                                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Trip Details Panel */}
                            <div className="xl:col-span-1">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
                                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-gray-900">Trip Details</h2>
                                        {selectedTrip && (
                                            <button
                                                onClick={() => setMapModalOpen(true)}
                                                className="text-emerald-600 hover:text-emerald-700 p-1"
                                            >
                                                <Maximize2 size={18} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        {selectedTrip ? (
                                            <>
                                                {/* Mini Map */}
                                                <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
                                                    <RouteMap trip={selectedTrip} gpsLogs={gpsLogs} />
                                                </div>

                                                {/* Trip Information */}
                                                <div className="space-y-3">
                                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                                        <span className="text-sm text-gray-600">Trip ID</span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            #{selectedTrip.id.substring(0, 8)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                                        <span className="text-sm text-gray-600">Start Time</span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {format(new Date(selectedTrip.startTime), 'HH:mm:ss')}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                                        <span className="text-sm text-gray-600">End Time</span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {format(new Date(selectedTrip.endTime), 'HH:mm:ss')}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                                        <span className="text-sm text-gray-600">Distance</span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {selectedTrip.distanceKm} km
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                                        <span className="text-sm text-gray-600">Total Fare</span>
                                                        <span className="text-sm font-bold text-emerald-600">
                                                            {formatCurrency(selectedTrip.totalFare)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                                        <span className="text-sm text-gray-600">Payment</span>
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTrip.paymentStatus)}`}>
                                                            {selectedTrip.paymentMethod} - {selectedTrip.paymentStatus}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between py-2">
                                                        <span className="text-sm text-gray-600">Sync Status</span>
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedTrip.syncStatus === 'pending'
                                                                ? 'bg-orange-100 text-orange-800'
                                                                : 'bg-green-100 text-green-800'
                                                            }`}>
                                                            {selectedTrip.syncStatus}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => setDetailsModalOpen(true)}
                                                    className="w-full mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                                                >
                                                    View Full Details
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center py-12">
                                                <MapPin size={48} className="mx-auto mb-4 text-gray-300" />
                                                <p className="text-gray-500">Select a trip to view details</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Daily Stats Section */}
                        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Daily Trip Statistics</h2>
                                <div className="flex items-center space-x-2">
                                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                        7 Days
                                    </button>
                                    <button className="px-3 py-1 text-sm bg-emerald-500 text-white rounded-lg">
                                        30 Days
                                    </button>
                                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                        Custom
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                                    <div className="text-center">
                                        <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
                                        <p className="text-gray-500">Daily trip statistics chart</p>
                                        <p className="text-xs text-gray-400 mt-1">Integration with chart library required</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Modal */}
            {mapModalOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-75" onClick={() => setMapModalOpen(false)}></div>
                    <div className="absolute inset-4 sm:inset-8 lg:inset-12 bg-white rounded-lg shadow-2xl overflow-hidden">
                        <div className="h-full flex flex-col">
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Trip Route - #{selectedTrip?.id.substring(0, 8)}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedTrip && format(new Date(selectedTrip.startTime), 'MMM dd, yyyy HH:mm')} -
                                        {selectedTrip && format(new Date(selectedTrip.endTime), 'HH:mm')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setMapModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 relative">
                                {selectedTrip && (
                                    <RouteMap trip={selectedTrip} gpsLogs={gpsLogs} expanded={true} />
                                )}
                                {/* Route Info Overlay */}
                                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                            <span className="text-sm text-gray-600">Start Point</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span className="text-sm text-gray-600">End Point</span>
                                        </div>
                                        <div className="pt-2 border-t border-gray-200">
                                            <p className="text-sm text-gray-600">
                                                Distance: <span className="font-medium">{selectedTrip?.distanceKm} km</span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Duration: <span className="font-medium">{selectedTrip?.durationMinutes} min</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {detailsModalOpen && selectedTrip && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setDetailsModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                            <div className="bg-white">
                                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Trip Details</h3>
                                    <button
                                        onClick={() => setDetailsModalOpen(false)}
                                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Trip Information */}
                                        <div>
                                            <div className="flex items-center space-x-2 mb-3">
                                                <Info size={18} className="text-emerald-600" />
                                                <h4 className="font-semibold text-gray-900">Trip Information</h4>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm text-gray-600">Trip ID</span>
                                                    <span className="text-sm font-medium text-gray-900">{selectedTrip.id}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm text-gray-600">Created At</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {format(new Date(selectedTrip.createdAt), 'MMM dd, yyyy HH:mm')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm text-gray-600">Data Source</span>
                                                    <span className="text-sm font-medium text-gray-900">{selectedTrip.dataSource}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Driver & Vehicle */}
                                        <div>
                                            <div className="flex items-center space-x-2 mb-3">
                                                <User size={18} className="text-emerald-600" />
                                                <h4 className="font-semibold text-gray-900">Driver & Vehicle</h4>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm text-gray-600">Driver ID</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {selectedTrip.driverId.substring(0, 12)}...
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm text-gray-600">Vehicle ID</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {selectedTrip.vehicleId.substring(0, 12)}...
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm text-gray-600">Meter ID</span>
                                                    <span className="text-sm font-medium text-gray-400">
                                                        {selectedTrip.meterId || 'Not assigned'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Route Details */}
                                        <div>
                                            <div className="flex items-center space-x-2 mb-3">
                                                <MapPin size={18} className="text-emerald-600" />
                                                <h4 className="font-semibold text-gray-900">Route Details</h4>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm text-gray-600">Start Location</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {selectedTrip.startLatitude}, {selectedTrip.startLongitude}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm text-gray-600">End Location</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {selectedTrip.endLatitude}, {selectedTrip.endLongitude}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm text-gray-600">Distance</span>
                                                    <span className="text-sm font-medium text-gray-900">{selectedTrip.distanceKm} km</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm text-gray-600">Duration</span>
                                                    <span className="text-sm font-medium text-gray-900">{selectedTrip.durationMinutes} minutes</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Details */}
                                        <div>
                                            <div className="flex items-center space-x-2 mb-3">
                                                <DollarSign size={18} className="text-emerald-600" />
                                                <h4 className="font-semibold text-gray-900">Payment Details</h4>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm text-gray-600">Base Fare</span>
                                                    <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedTrip.baseFare)}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm text-gray-600">Distance Fare</span>
                                                    <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedTrip.distanceFare)}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm text-gray-600">Time Fare</span>
                                                    <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedTrip.timeFare)}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-sm text-gray-600">Total Fare</span>
                                                    <span className="text-sm font-bold text-emerald-600">{formatCurrency(selectedTrip.totalFare)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* GPS Tracking Logs */}
                                    <div className="mt-6">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Navigation size={18} className="text-emerald-600" />
                                            <h4 className="font-semibold text-gray-900">GPS Tracking Logs</h4>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                                            {gpsLogs && gpsLogs.length > 0 ? (
                                                <p className="text-sm text-gray-600">{gpsLogs.length} GPS points recorded</p>
                                            ) : (
                                                <>
                                                    <MapPin size={32} className="mx-auto mb-2 text-gray-300" />
                                                    <p className="text-sm text-gray-500">No GPS logs available for this trip</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                                    <button
                                        onClick={() => setDetailsModalOpen(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2">
                                        <Download size={16} />
                                        <span>Export Details</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Layout wrapper component
const TripManagementLayout = () => {
    return <TripManagement />;
};

export default TripManagementLayout;
