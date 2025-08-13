import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    Users,
    Car,
    FileText,
    RefreshCw,
    Bell,
    Settings,
    Menu,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCart';
import DriverChart from '../components/charts/DriverChart';
import VehicleChart from '../components/charts/VehicleChart';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';
import { useAuthContext } from '../context/AuthContext';


// Import your hooks
import { useGetDriverStats } from '../hook/driverHook';
import { useGeographyStats } from '../hook/geographyHook';
import { useTripStats } from '../hook/tripHook';
import { useGetUserStats } from '../hook/userHook';
import { useVehicleStatistics } from '../hook/VehicleHook';

const DashboardPage = () => {
    const { user } = useAuthContext();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard');


    // Check if screen is mobile
    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 1024; // lg breakpoint
            setIsMobile(mobile);
            // Only auto-close sidebar on mobile
            if (mobile) {
                setSidebarOpen(false);
            } else {
                // On desktop, sidebar should be open by default
                setSidebarOpen(true);
            }
        };
        // Check on mount
        checkScreenSize();
        // Add resize listener
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Fetch data using hooks
    const {
        data: driverStats,
        isLoading: driverLoading,
        refetch: refetchDrivers
    } = useGetDriverStats();

    const {
        data: geographyStats,
        isLoading: geographyLoading,
        refetch: refetchGeography
    } = useGeographyStats();

    const {
        data: tripStats,
        isLoading: tripLoading,
        refetch: refetchTrips
    } = useTripStats();

    const {
        data: userStats,
        isLoading: userLoading,
        refetch: refetchUsers
    } = useGetUserStats();

    const {
        data: vehicleStats,
        isLoading: vehicleLoading,
        refetch: refetchVehicles
    } = useVehicleStatistics();

    const isLoading = driverLoading || geographyLoading || tripLoading || userLoading || vehicleLoading;

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            handleRefresh();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);

        // Add 5 seconds delay as requested
        await new Promise(resolve => setTimeout(resolve, 5000));

        try {
            await Promise.all([
                refetchDrivers(),
                refetchGeography(),
                refetchTrips(),
                refetchUsers(),
                refetchVehicles(),
            ]);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };
    const handleSidebarClose = () => {
        // Only close sidebar on mobile
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    const handleNavigate = (section) => {
        // Navigation is now handled by the Link components
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Regional data for table
    const regionData = geographyStats?.data?.citiesByRegion ?
        Object.entries(geographyStats.data.citiesByRegion).map(([region, cities]) => ({
            name: region,
            cities,
            majorCities: geographyStats.data.majorCitiesByRegion[region] || 0,
            multiplier: Math.random() * 0.4 + 0.8, // Placeholder since not in geography stats
        })) : [];

    if (isLoading && !isRefreshing) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={handleSidebarClose}
                    activeSection={activeSection}
                    onNavigate={handleNavigate}
                    isMobile={isMobile}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="bg-white shadow-sm border-b border-gray-200">
                        <div className="flex items-center justify-between px-6 py-4">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden text-gray-600 hover:text-gray-800"
                                >
                                    <Menu size={24} />
                                </button>
                                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 overflow-y-auto p-6">
                        <DashboardSkeleton />
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeSection={activeSection}
                onNavigate={setActiveSection}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <Menu size={24} />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {activeSection === 'dashboard' ? 'Dashboard Overview' :
                                    activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center text-sm text-gray-500">
                                <span>Last updated: {formatTime(lastUpdate)}</span>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Refresh Data"
                            >
                                <RefreshCw
                                    size={20}
                                    className={isRefreshing ? 'animate-spin' : ''}
                                />
                            </motion.button>

                            <button className="relative p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            </button>

                            <button className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                <Settings size={20} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {isRefreshing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
                        >
                            <div className="bg-white rounded-lg p-6 shadow-xl">
                                <div className="flex items-center space-x-3">
                                    <RefreshCw className="animate-spin text-emerald-500" size={24} />
                                    <span className="text-gray-700">Refreshing dashboard data...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Revenue"
                                value={formatCurrency(tripStats?.data?.totalRevenue || 0)}
                                subtitle={`From ${tripStats?.data?.totalTrips || 0} trips`}
                                icon={DollarSign}
                                trend="+12.5%"
                                gradient="emerald"
                                delay={0.1}
                            />

                            <StatCard
                                title="Active Drivers"
                                value={`${driverStats?.data?.activeDrivers || 0} / ${driverStats?.data?.totalDrivers || 0}`}
                                subtitle={`${((driverStats?.data?.activeDrivers || 0) / (driverStats?.data?.totalDrivers || 1) * 100).toFixed(1)}% active`}
                                icon={Users}
                                trend="77.8%"
                                gradient="blue"
                                delay={0.2}
                            />

                            <StatCard
                                title="Active Vehicles"
                                value={`${vehicleStats?.data?.activeVehicles || 0} / ${vehicleStats?.data?.totalVehicles || 0}`}
                                subtitle="All operational"
                                icon={Car}
                                trend="100%"
                                gradient="purple"
                                delay={0.3}
                            />

                            <StatCard
                                title="Pending Documents"
                                value="4"
                                subtitle="Awaiting review"
                                icon={FileText}
                                trend="Pending"
                                gradient="rose"
                                delay={0.4}
                            />
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white rounded-xl shadow-lg p-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Driver Statistics</h3>
                                <DriverChart data={driverStats?.data} />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-white rounded-xl shadow-lg p-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Distribution</h3>
                                <VehicleChart data={vehicleStats?.data} />
                            </motion.div>
                        </div>

                        {/* Additional Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="bg-white rounded-xl shadow-lg p-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">User Overview</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Total Users</span>
                                        <span className="font-semibold">{userStats?.data?.totalUsers || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Active</span>
                                        <span className="font-semibold text-emerald-600">{userStats?.data?.activeUsers || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Admins</span>
                                        <span className="font-semibold">{userStats?.data?.usersByRole?.admin || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Viewers</span>
                                        <span className="font-semibold">{userStats?.data?.usersByRole?.viewer || 0}</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="bg-white rounded-xl shadow-lg p-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Geography Coverage</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Regions</span>
                                        <span className="font-semibold">{geographyStats?.data?.totalRegions || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Cities</span>
                                        <span className="font-semibold">{geographyStats?.data?.totalCities || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Major Cities</span>
                                        <span className="font-semibold text-blue-600">{geographyStats?.data?.majorCities || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Coverage</span>
                                        <span className="font-semibold text-emerald-600">100%</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.9 }}
                                className="bg-white rounded-xl shadow-lg p-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Information</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Total Vehicles</span>
                                        <span className="font-semibold">{vehicleStats?.data?.totalVehicles || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Active</span>
                                        <span className="font-semibold text-emerald-600">{vehicleStats?.data?.activeVehicles || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Expired Insurance</span>
                                        <span className="font-semibold text-red-600">{vehicleStats?.data?.expiredInsurance || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Expired Inspection</span>
                                        <span className="font-semibold text-amber-600">{vehicleStats?.data?.expiredInspection || 0}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Regional Performance Table */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="bg-white rounded-xl shadow-lg p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Regional Performance</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-gray-600 font-medium">Region</th>
                                            <th className="text-center py-3 px-4 text-gray-600 font-medium">Cities</th>
                                            <th className="text-center py-3 px-4 text-gray-600 font-medium">Major Cities</th>
                                            <th className="text-center py-3 px-4 text-gray-600 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {regionData.map((region, index) => (
                                            <motion.tr
                                                key={region.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 1.1 + index * 0.05 }}
                                                className="border-b hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-3 px-4 font-medium">{region.name}</td>
                                                <td className="text-center py-3 px-4">{region.cities}</td>
                                                <td className="text-center py-3 px-4">{region.majorCities}</td>
                                                <td className="text-center py-3 px-4">
                                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-600">
                                                        Active
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
