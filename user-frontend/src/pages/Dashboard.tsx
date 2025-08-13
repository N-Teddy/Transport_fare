import { useMemo } from 'react';
import { motion } from 'framer-motion';
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
    CreditCard, Menu,
    User
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';

// --- User's Imports (preserved) ---
import type { TripResponseDto } from '../types/trip';
import { useGetTripsByDriver } from '../hooks/tripHook';
import { useAuth } from '../context/AuthContext';
import { useGetVehicle } from '../hooks/vehicleHook';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

//================================================================
// HELPER & UI COMPONENTS
//================================================================

export const cardAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
const formatDate = (date: Date | string | undefined) => {
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
// FAREWAY LOGO COMPONENT
//================================================================

export const FareWayHeaderLogo = () => (
    <div className="flex items-center space-x-3">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.2" />
            <path d="M12 24L18 18L24 24L30 18L36 24" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="18" cy="30" r="2.5" fill="white" />
            <circle cx="30" cy="30" r="2.5" fill="white" />
        </svg>
        <div className="text-white">
            <h1 className="text-2xl font-bold">FareWay</h1>
            <p className="text-xs text-emerald-100">Driver Dashboard</p>
        </div>
    </div>
);


//================================================================
// DASHBOARD SUB-COMPONENTS
//================================================================

const DashboardHeader = () => {
    const navigate = useNavigate();
    const { authData: { username } } = useAuth();

    return (
        <motion.header
            className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-3xl shadow-xl"
            initial="hidden"
            animate="visible"
            variants={cardAnimation}
        >
            <div className="flex items-center space-x-6">
                {/* Mobile Menu Button */}
                <button className="lg:hidden p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors">
                    <Menu size={24} className="text-white" />
                </button>

                <FareWayHeaderLogo />

                <div className="hidden md:block border-l border-white/30 pl-6 ml-2">
                    <h2 className="text-xl font-semibold">Welcome back, {username || 'Driver'}!</h2>
                    <p className="text-emerald-100 text-sm">Your performance at a glance</p>
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
                <button className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full shadow-lg hover:bg-white/30 transition-colors duration-300 border border-white/30">
                    <Settings size={20} />
                    <span>Settings</span>
                </button>
            </div>
        </motion.header>
    );
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
            <div className="bg-white rounded-3xl shadow-xl p-6 flex items-center space-x-4 hover:shadow-2xl transition-shadow">
                <div className="p-3 rounded-full bg-emerald-100 text-emerald-500"><Route /></div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Total Trips</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalTrips}</p>
                </div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-6 flex items-center space-x-4 hover:shadow-2xl transition-shadow">
                <div className="p-3 rounded-full bg-teal-100 text-teal-500"><Wallet /></div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalEarnings)}</p>
                </div>
            </div>
            <div className="bg-white rounded-3xl shadow-xl p-6 flex items-center space-x-4 hover:shadow-2xl transition-shadow">
                <div className="p-3 rounded-full bg-cyan-100 text-cyan-500"><Gauge /></div>
                <div>
                    <p className="text-sm text-gray-500 font-medium">Total Distance</p>
                    <p className="text-2xl font-bold text-gray-800">
                        {/* {stats.totalDistance.toFixed(1)} */}
                        km</p>
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
                        scales: {
                            x: { grid: { display: false }, ticks: { color: '#4B5563' } },
                            y: { beginAtZero: true, grid: { color: '#E5E7EB' }, ticks: { color: '#4B5563' } }
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: '#1F2937',
                                titleColor: '#F9FAFB',
                                bodyColor: '#D1D5DB',
                                borderColor: '#D1D5DB',
                                borderWidth: 1,
                                padding: 10,
                                cornerRadius: 8
                            }
                        }
                    }}
                />
            </div>
        </motion.section>
    );
};

const VehicleInfo = ({ vehicle }: { vehicle: any | undefined }) => {
    if (!vehicle) return (
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">My Vehicle</h2>
            <div className="text-center py-8 text-gray-500">
                <Car size={48} className="mx-auto mb-4 opacity-30" />
                <p>No vehicle information available</p>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
            <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-800">My Vehicle</h2>
                <div className={`px-3 py-1 text-xs font-semibold rounded-full ${vehicle.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-yellow-500 text-white'}`}>
                    {vehicle.status}
                </div>
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
                            <p className="text-sm text-gray-500">Distance:
                                {/* {trip.distanceKm?.toFixed(1)} */}
                                km</p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                            <span className="text-lg font-bold text-emerald-600">{formatCurrency(trip.totalFare)}</span>
                            <div className={`px-2 py-1 text-xs font-semibold rounded-full ${trip.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
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
    const { authData: { userId } } = useAuth();
    const { data: Trip } = useGetTripsByDriver(userId, !!userId);
    const { data: PaginatedResponseDto } = useGetVehicle(userId, !!userId);

    const trips = Trip?.data.items || [];
    const vehicle = PaginatedResponseDto?.data.items[0];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Persistent Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-72">
                <div className="container mx-auto px-4 py-8">
                    <div className="space-y-12">
                        <DashboardHeader />
                        <StatsSection trips={trips} />
                        <WeeklyEarningsChart trips={trips} />

                        {/* Vehicle & Trips Grid */}
                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <VehicleInfo vehicle={vehicle} />
                            <RecentTrips trips={trips} />
                        </section>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Bottom Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
                <div className="flex justify-around">
                    <button className="flex flex-col items-center p-2 text-emerald-600">
                        <Route size={20} />
                        <span className="text-xs mt-1">Dashboard</span>
                    </button>
                    <button className="flex flex-col items-center p-2 text-gray-500">
                        <MapPin size={20} />
                        <span className="text-xs mt-1">New Trip</span>
                    </button>
                    <button className="flex flex-col items-center p-2 text-gray-500">
                        <User size={20} />
                        <span className="text-xs mt-1">Profile</span>
                    </button>
                    <button className="flex flex-col items-center p-2 text-gray-500">
                        <Settings size={20} />
                        <span className="text-xs mt-1">Settings</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
