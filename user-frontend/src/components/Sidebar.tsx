import { motion } from 'framer-motion';
import { History, User, Star, DollarSign, ChevronRight, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
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

    // FareWay Logo Component
    const FareWayLogo = () => (
        <div className="flex items-center space-x-3 mb-8">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="url(#gradient1)" />
                <path d="M10 20L15 15L20 20L25 15L30 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="15" cy="25" r="2" fill="white" />
                <circle cx="25" cy="25" r="2" fill="white" />
                <defs>
                    <linearGradient id="gradient1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#10B981" />
                        <stop offset="1" stopColor="#14B8A6" />
                    </linearGradient>
                </defs>
            </svg>
            <div>
                <h2 className="text-xl font-bold text-gray-800">FareWay</h2>
                <p className="text-xs text-gray-500">Driver Portal</p>
            </div>
        </div>
    );

    return (
        <aside className="hidden lg:block fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-40 overflow-y-auto">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200">
                <FareWayLogo />

                {/* User Profile Section */}
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                    <img
                        src={`https://placehold.co/45x45/10B981/ffffff?text=${username?.charAt(0).toUpperCase() ?? 'U'}`}
                        alt="User Avatar"
                        className="w-11 h-11 rounded-full border-2 border-emerald-400 shadow-sm"
                    />
                    <div>
                        <p className="text-sm font-semibold text-gray-800">{username || 'Driver'}</p>
                        <p className="text-xs text-emerald-600">Active Driver</p>
                    </div>
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

            {/* Quick Stats
            <div className="px-6 py-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-4 text-white">
                    <h3 className="font-semibold mb-3">Today's Summary</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-emerald-100">Trips</span>
                            <span className="font-bold">0</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-emerald-100">Earnings</span>
                            <span className="font-bold">$0.00</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-emerald-100">Hours Online</span>
                            <span className="font-bold">0h</span>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* Sidebar Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                        <Phone size={16} className="text-emerald-600" />
                        <p className="text-sm font-medium text-gray-700">Need help?</p>
                    </div>
                    <button className="text-emerald-600 font-semibold text-sm hover:text-emerald-700 transition-colors">
                        Contact Support →
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
