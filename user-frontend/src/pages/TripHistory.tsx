// TripHistory.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    MapPin,
    DollarSign,
    ChevronRight,
    Filter,
    Download,
    Car,
    CreditCard,
    Eye,
    X,
    Route,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Star
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {jwtDecode} from 'jwt-decode';
import Sidebar from '../components/Sidebar';
import { useGetTripsByDriver } from '../hooks/tripHook';
import TripDetailsModal from '../components/TripDetailsModal';

// Types
interface Trip {
    id: string;
    createdAt: string;
    updatedAt: string;
    driverId: string;
    vehicleId: string;
    meterId: string | null;
    startTime: string;
    endTime: string | null;
    startLatitude: string;
    startLongitude: string;
    endLatitude: string | null;
    endLongitude: string | null;
    distanceKm: number;
    durationMinutes: number | null;
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surcharges: number;
    totalFare: number;
    paymentMethod: string;
    paymentStatus: string;
    paymentReference: string | null;
    passengerPhone: string | null;
    dataSource: string;
    syncStatus: string;
    syncedAt: string | null;
}

interface Filters {
    startDate: string;
    endDate: string;
    duration: string;
}

const TripHistory: React.FC = () => {
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<Filters>({
        startDate: '',
        endDate: '',
        duration: ''
    });

    // Get userId from JWT token
    const getUserIdFromToken = (): string | null => {
        try {
            const token = localStorage.getItem('access_token');
            if (token) {
                const decoded: any = jwtDecode(token);
                return decoded.userId || decoded.sub || decoded.id || decoded.driverId;
            }
        } catch (error) {
            console.error('Error decoding token:', error);
        }
        return null;
    };

    const driverId = getUserIdFromToken();

    // Fetch trips using the hook
    const { data, isLoading, error } = useGetTripsByDriver(driverId || '', !!driverId);

    const trips = data?.data?.items || [];
    const totalTrips = data?.data?.total || 0;
    const itemsPerPage = data?.data?.limit || 10;
    const totalPages = Math.ceil(totalTrips / itemsPerPage);

    // Filter trips based on filters
    const filteredTrips = useMemo(() => {
        let filtered = [...trips];

        // Date range filter
        if (filters.startDate) {
            filtered = filtered.filter(trip =>
                new Date(trip.startTime) >= new Date(filters.startDate)
            );
        }
        if (filters.endDate) {
            filtered = filtered.filter(trip =>
                new Date(trip.startTime) <= new Date(filters.endDate)
            );
        }

        // Duration filter
        if (filters.duration) {
            filtered = filtered.filter(trip => {
                const duration = trip.durationMinutes || 0;
                switch (filters.duration) {
                    case '0-15':
                        return duration >= 0 && duration <= 15;
                    case '15-30':
                        return duration > 15 && duration <= 30;
                    case '30-60':
                        return duration > 30 && duration <= 60;
                    case '60+':
                        return duration > 60;
                    default:
                        return true;
                }
            });
        }

        return filtered;
    }, [trips, filters]);

    // Calculate statistics
    const stats = useMemo(() => {
        const completed = filteredTrips.filter(t => t.paymentStatus === 'completed');
        const totalEarnings = completed.reduce((sum, t) => sum + (t.totalFare || 0), 0);
        const totalDistance = completed.reduce((sum, t) => sum + parseFloat(t.distanceKm || 0), 0);
        const totalDuration = completed.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
        const averageRating = 4.8; // This would come from a different API

        return {
            totalTrips: filteredTrips.length,
            totalEarnings,
            totalDistance,
            averageRating
        };
    }, [filteredTrips]);

    const handleViewDetails = (trip: Trip) => {
        setSelectedTrip(trip);
        setDetailsModalOpen(true);
    };

    const handleExportCSV = () => {
        const csvContent = convertToCSV(filteredTrips);
        downloadCSV(csvContent, `trip-history-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    };

    const convertToCSV = (data: Trip[]) => {
        const headers = ['Trip ID', 'Date', 'Start Time', 'End Time', 'Duration (min)', 'Distance (km)', 'Total Fare', 'Payment Method', 'Payment Status'];
        const rows = data.map(trip => [
            trip.id.substring(0, 8),
            format(parseISO(trip.startTime), 'yyyy-MM-dd'),
            format(parseISO(trip.startTime), 'HH:mm'),
            trip.endTime ? format(parseISO(trip.endTime), 'HH:mm') : 'Ongoing',
            trip.durationMinutes || '0',
            trip.distanceKm || '0',
            trip.totalFare || '0',
            trip.paymentMethod,
            trip.paymentStatus
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    };

    const downloadCSV = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            duration: ''
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="text-emerald-600" size={20} />;
            case 'pending':
                return <Clock className="text-yellow-600" size={20} />;
            default:
                return <AlertCircle className="text-gray-600" size={20} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    // Pagination handlers
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // You might need to refetch data here if backend supports pagination
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Sidebar />

            <div className="lg:ml-72 p-4 md:p-6">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-6 text-white shadow-xl">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-3">
                                    <Clock size={32} />
                                    Trip History
                                </h1>
                                <p className="text-emerald-100">View and manage your completed trips</p>
                            </div>
                            <button
                                onClick={handleExportCSV}
                                className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-full shadow-lg hover:bg-gray-50 transition-all flex items-center gap-2"
                            >
                                <Download size={20} />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Statistics Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
                >
                    <motion.div variants={itemVariants}>
                        <StatCard
                            icon={<Car className="text-blue-600" size={24} />}
                            title="Total Trips"
                            value={stats.totalTrips.toString()}
                            trend="+12%"
                            trendUp={true}
                            bgColor="bg-blue-100"
                        />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <StatCard
                            icon={<DollarSign className="text-green-600" size={24} />}
                            title="Total Earnings"
                            value={`$${stats.totalEarnings.toFixed(2)}`}
                            trend="+8%"
                            trendUp={true}
                            bgColor="bg-green-100"
                        />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <StatCard
                            icon={<Route className="text-purple-600" size={24} />}
                            title="Total Distance"
                            value={`${stats.totalDistance.toFixed(1)} km`}
                            trend="0%"
                            trendUp={false}
                            bgColor="bg-purple-100"
                        />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <StatCard
                            icon={<Star className="text-yellow-600" size={24} />}
                            title="Average Rating"
                            value={stats.averageRating.toFixed(1)}
                            trend="+0.2"
                            trendUp={true}
                            bgColor="bg-yellow-100"
                        />
                    </motion.div>
                </motion.div>

                {/* Filters Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="text-gray-600" size={20} />
                        <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration
                            </label>
                            <select
                                value={filters.duration}
                                onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none bg-white"
                            >
                                <option value="">All Durations</option>
                                <option value="0-15">0-15 minutes</option>
                                <option value="15-30">15-30 minutes</option>
                                <option value="30-60">30-60 minutes</option>
                                <option value="60+">60+ minutes</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <X size={18} />
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Trips List */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                    {/* List Header */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">Recent Trips</h3>
                            <span className="text-sm text-gray-600">
                                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalTrips)}-
                                {Math.min(currentPage * itemsPerPage, totalTrips)} of {totalTrips} trips
                            </span>
                        </div>
                    </div>

                    {/* Trip Items */}
                    <div className="divide-y divide-gray-100">
                        {isLoading ? (
                            // Loading skeleton
                            <div className="p-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="mb-4">
                                        <div className="animate-pulse">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                                </div>
                                                <div className="h-8 bg-gray-200 rounded w-24"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="p-12 text-center">
                                <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
                                <p className="text-gray-600 mb-2">Failed to load trips</p>
                                <p className="text-sm text-gray-500">Please try again later</p>
                            </div>
                        ) : filteredTrips.length === 0 ? (
                            <div className="p-12 text-center">
                                <Car className="mx-auto text-gray-300 mb-4" size={48} />
                                <p className="text-gray-600 mb-2">No trips found</p>
                                <p className="text-sm text-gray-500">
                                    {filters.startDate || filters.endDate || filters.duration
                                        ? 'Try adjusting your filters'
                                        : 'Start a new trip to see it here'}
                                </p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {filteredTrips.map((trip, index) => (
                                    <motion.div
                                        key={trip.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <TripItem
                                            trip={trip}
                                            onViewDetails={handleViewDetails}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    <ChevronRight className="rotate-180" size={18} />
                                    Previous
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-10 h-10 font-medium rounded-lg transition-all ${currentPage === pageNum
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    Next
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Trip Details Modal */}
                {selectedTrip && (
                    <TripDetailsModal
                        trip={selectedTrip}
                        isOpen={detailsModalOpen}
                        onClose={() => {
                            setDetailsModalOpen(false);
                            setSelectedTrip(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

// StatCard Component
interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    trend: string;
    trendUp: boolean;
    bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, trend, trendUp, bgColor }) => {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-3 ${bgColor} rounded-xl`}>
                    {icon}
                </div>
                {trend !== "0%" && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${trendUp ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                        }`}>
                        {trend}
                        {trendUp ? (
                            <TrendingUp size={12} />
                        ) : (
                            <span className="text-xs">—</span>
                        )}
                    </span>
                )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    );
};

// TripItem Component
interface TripItemProps {
    trip: Trip;
    onViewDetails: (trip: Trip) => void;
}

const TripItem: React.FC<TripItemProps> = ({ trip, onViewDetails }) => {
    const isCompleted = trip.paymentStatus === 'completed';
    const isPending = trip.paymentStatus === 'pending';

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return 'Ongoing';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins} minutes`;
    };

    const getStatusIcon = () => {
        if (isCompleted) return <CheckCircle className="text-emerald-600" size={20} />;
        if (isPending) return <Clock className="text-yellow-600" size={20} />;
        return <AlertCircle className="text-gray-600" size={20} />;
    };

    const getStatusBgColor = () => {
        if (isCompleted) return 'bg-emerald-100';
        if (isPending) return 'bg-yellow-100';
        return 'bg-gray-100';
    };

    const getStatusTextColor = () => {
        if (isCompleted) return 'bg-green-100 text-green-700';
        if (isPending) return 'bg-yellow-100 text-yellow-700';
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className={`p-3 ${getStatusBgColor()} rounded-xl`}>
                        {getStatusIcon()}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-800">
                                Trip #{trip.id.substring(0, 8)}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusTextColor()}`}>
                                {trip.paymentStatus === 'completed' ? 'Completed' :
                                    trip.paymentStatus === 'pending' ? 'In Progress' :
                                        trip.paymentStatus}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="text-gray-400" size={16} />
                                <span>
                                    {format(parseISO(trip.startTime), 'MMM d, yyyy')} at{' '}
                                    {format(parseISO(trip.startTime), 'h:mm a')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="text-gray-400" size={16} />
                                <span>Duration: {formatDuration(trip.durationMinutes)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Route className="text-gray-400" size={16} />
                                <span>Distance: {trip.distanceKm || '--'} km</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CreditCard className="text-gray-400" size={16} />
                                <span>Payment: {trip.paymentMethod}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <p className="text-2xl font-bold text-gray-800">
                        {trip.totalFare ? `$${trip.totalFare.toFixed(2)}` : '--'}
                    </p>
                    <button
                        onClick={() => onViewDetails(trip)}
                        className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                        <Eye size={16} />
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TripHistory;
