import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import {
    MapPin, Settings, Route, Wallet, Gauge, Car, Users, AlertCircle,
    CreditCard, Menu, X, History, User, Star, DollarSign, ChevronRight
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';

// --- User's Imports (preserved) ---
import type { TripResponseDto } from '../types/trip';
import { useGetTripsByDriver } from '../hooks/tripHook';
import { useAuth } from '../context/AuthContext';
import { useGetVehicle } from '../hooks/vehicleHook';
import { useNavigate } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

//================================================================
// HELPER & UI COMPONENTS
//================================================================

const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const formatDate = (date: Date | string ) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

interface TripData {
    id: string;
    startTime: Date;
    distanceKm?: number;
    totalFare: number;
    paymentStatus: string;
}

interface TripStats {
    id: string;
    totalFare: number;
    distanceKm?: number;
}

interface StatsSectionProps {
    trips?: TripStats[];
}

interface RecentTripsProps {
    trips: TripData[];
}

//================================================================
// SIDEBAR COMPONENT
//================================================================

const Sidebar = ({ isOpen, toggleSidebar }: { isOpen: boolean; toggleSidebar: () => void }) => {
    const navigate = useNavigate();
    const { authData: { username } } = useAuth();

    const menuItems = [
        {
            icon: History,
            label: 'Trip History',
            onClick: () => navigate('/trip-history'),
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            hoverBg: 'hover:bg-emerald-100'
        },
        {
            icon: User,
            label: 'Profile',
            onClick: () => navigate('/profile'),
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            hoverBg: 'hover:bg-blue-100'
        },
        {
            icon: Star,
            label: 'Rating',
            onClick: () => navigate('/rating'),
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            hoverBg: 'hover:bg-yellow-100'
        },
        {
            icon: DollarSign,
            label: 'Regional Rates',
            onClick: () => navigate('/rates'),
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            hoverBg: 'hover:bg-purple-100'
        }
    ];

    return (
        <>
            {/* Overlay for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleSidebar}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    x: isOpen ? 0 : '-100%',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto`}
            >
                {/* Sidebar Header */}
                <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <img
                                src={`https://placehold.co/50x50/ecfdf5/065f46?text=${username?.charAt(0).toUpperCase() ?? 'U'}`}
                                alt="User Avatar"
                                className="w-12 h-12 rounded-full border-3 border-white shadow-md"
                            />
                            <div>
                                <h3 className="text-white font-bold text-lg">{username || 'Driver'}</h3>
                                <p className="text-emerald-100 text-sm">Driver Dashboard</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <X size={20} className="text-white" />
                        </button>
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={item.onClick}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl ${item.bgColor} ${item.hoverBg} transition-all duration-200 group`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-xl bg-white shadow-sm ${item.color}`}>
                                    <item.icon size={20} />
                                </div>
                                <span className={`font-medium ${item.color}`}>{item.label}</span>
                            </div>
                            <ChevronRight
                                size={18}
                                className={`${item.color} opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-200`}
                            />
                        </motion.button>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4">
                        <p className="text-sm text-gray-600 mb-2">Need help?</p>
                        <button className="text-emerald-600 font-semibold text-sm hover:text-emerald-700 transition-colors">
                            Contact Support →
                        </button>
                    </div>
                </div>
            </motion.aside>
        </>
    );
};

//================================================================
// DASHBOARD SUB-COMPONENTS
//================================================================

const DashboardHeader = ({ username, toggleSidebar }: { username: string | null; toggleSidebar: () => void }) => {
    const navigate = useNavigate();

    return (
        <motion.header
            className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-3xl shadow-xl"
            initial="hidden"
            animate="visible"
            variants={cardAnimation}
        >
            <div className="flex items-center space-x-4">
                {/* Menu Button */}
                <button
                    onClick={toggleSidebar}
                    className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                >
                    <Menu size={24} className="text-white" />
                    teddy
                </button>

                <img src={`https://placehold.co/60x60/ecfdf5/065f46?text=${username?.charAt(0).toUpperCase() ?? 'U'}`} alt="User Avatar" className="w-16 h-16 rounded-full border-4 border-white shadow-md" />
                <div>
                    <h1 className="text-3xl font-bold">Welcome, {username || 'Driver'}!</h1>
                    <p className="text-emerald-100">Your performance at a glance.jk</p>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                    onClick={() => navigate('/trip')}
                    className="flex items-center space-x-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300"
                >
                    <MapPin size={20} />
                    <span>Start a Trip</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-3 bg-white text-emerald-600 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300">
                    <Settings size={20} />
                    <span>Settings</span>
                </button>
            </div>
        </motion.header>
    )
};

const StatsSection = ({ trips }: StatsSectionProps) => {
    const stats = useMemo(() => {
        if (!trips) return { totalTrips: 0, totalEarnings: 0, totalDistance: 0 };
        return {
            totalTrips: trips.length,
            totalEarnings: trips.reduce((sum, trip) => sum + trip.totalFare, 0),
            totalDistance: trips.reduce((sum, trip) => sum + (trip.distanceKm || 0), 0),
        };
    }, [trips]);

    return (
        <motion.section className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={cardAnimation}>
            <div className="bg-white rounded-3xl shadow-xl p-6 flex items-center space-x-4">
                <div className="p-3 rounded-full bg-emerald-100 text-emerald-500"><Route /></div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Total Trips</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalTrips}</p>
                </div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-6 flex items-center space-x-4">
                <div className="p-3 rounded-full bg-teal-100 text-teal-500"><Wallet /></div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalEarnings)}</p>
                </div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-6 flex items-center space-x-4">
                <div className="p-3 rounded-full bg-cyan-100 text-cyan-500"><Gauge /></div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Total Distance</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalDistance.toFixed(1)} km</p>
                </div>
            </div>
        </motion.section>
    );
};

const WeeklyEarningsChart = ({ trips }: { trips: TripResponseDto[] | undefined }) => {
    const chartData = useMemo(() => {
        const earningsByDay = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
        trips?.forEach(trip => {
            const dayOfWeek = new Date(trip.startTime).getDay();
            earningsByDay[dayOfWeek] += trip.totalFare;
        });
        const rotatedEarnings = [...earningsByDay.slice(1), earningsByDay[0]];
        return {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Weekly Earnings ($)',
                data: rotatedEarnings,
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1,
                borderRadius: 8,
                barThickness: 20,
            }]
        };
    }, [trips]);

    return (
        <motion.section className="bg-white rounded-3xl shadow-xl p-8 space-y-6" variants={cardAnimation}>
            <h2 className="text-2xl font-bold text-gray-800">Weekly Earnings</h2>
            <div className="relative h-80">
                <Bar
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: { x: { grid: { display: false }, ticks: { color: '#4B5563' } }, y: { beginAtZero: true, grid: { color: '#E5E7EB' }, ticks: { color: '#4B5563' } } },
                        plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1F2937', titleColor: '#F9FAFB', bodyColor: '#D1D5DB', borderColor: '#D1D5DB', borderWidth: 1, padding: 10, cornerRadius: 8 } }
                    }}
                />
            </div>
        </motion.section>
    );
};

const VehicleInfo = ({ vehicle }: { vehicle: any | undefined }) => {
    if (!vehicle) return null;
    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
            <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-800">My Vehicle</h2>
                <div className={`px-3 py-1 text-xs font-semibold rounded-full ${vehicle.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-yellow-500 text-white'}`}>{vehicle.status}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-gray-100"><Car size={20} className="text-gray-600" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Make & Model</p>
                        <p className="font-semibold">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-gray-100"><CreditCard size={20} className="text-gray-600" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">License Plate</p>
                        <p className="font-semibold">{vehicle.licensePlate}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-gray-100"><Users size={20} className="text-gray-600" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Vehicle Type</p>
                        <p className="font-semibold">{vehicle.vehicleType?.typeName} ({vehicle.vehicleType?.maxPassengers} passengers)</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-red-100"><AlertCircle size={20} className="text-red-500" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Inspection Expiry</p>
                        <p className="font-semibold text-red-500">{formatDate(vehicle.inspectionExpiry)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RecentTrips = ({ trips }: RecentTripsProps) => {
    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Trips</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {trips.map(trip => (
                    <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col">
                            <p className="font-medium text-gray-900">Trip on {formatDate(trip.startTime)}</p>
                            <p className="text-sm text-gray-500">Distance: {trip.distanceKm?.toFixed(1)} km</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                            <span className="text-lg font-bold text-emerald-600">{formatCurrency(trip.totalFare)}</span>
                            <div className={`px-2 py-1 text-xs font-semibold rounded-full ${trip.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {trip.paymentStatus}
                            </div>
                        </div>
                    </div>
                ))}
                {trips.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <Route size={48} className="mx-auto mb-4 opacity-30" />
                        <p>No recent trips found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

//================================================================
// MAIN DASHBOARD COMPONENT
//================================================================
const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { authData: { userId, username } } = useAuth();
    const { data: Trip } = useGetTripsByDriver(userId, !!userId);
    const { data: PaginatedResponseDto } = useGetVehicle(userId, !!userId);

    const trips = Trip?.data.items || [];
    const vehicle = PaginatedResponseDto?.data.items[0];

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <>
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content */}
            <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : ''}`}>
                <div className="container mx-auto px-4 py-8">
                    {/* This container provides the vertical spacing between sections */}
                    <div className="space-y-12">
                        <DashboardHeader username={username} toggleSidebar={toggleSidebar} />
                        <StatsSection trips={trips} />
                        <WeeklyEarningsChart trips={trips} />

                        {/* This section creates the side-by-side layout for Vehicle & Trips */}
                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <VehicleInfo vehicle={vehicle} />
                            <RecentTrips trips={trips} />
                        </section>
                    </div>
                </div>
            </div>

            {/* Floating Action Button for Mobile */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleSidebar}
                className="lg:hidden fixed bottom-6 right-6 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-2xl z-30"
            >
                <Menu size={24} />
            </motion.button>
        </>
    );
};

export default Dashboard;
