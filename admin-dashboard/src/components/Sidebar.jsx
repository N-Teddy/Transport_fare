import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    Users,
    Car,
    FileText,
    DollarSign,
    Map,
    Route,
    Shield,
    LogOut,
    X,
    IdCard,
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { CircleUser } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, activeSection, onNavigate }) => {
    const { user, logout } = useAuthContext();

    const location = useLocation();

    const navigationItems = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
        { id: 'trips', label: 'Trips', icon: Route, path: '/trip', badge: '25' },
        { id: 'users', label: 'Users', icon: Users, path: '/user', badge: '7' },
        { id: 'profile', label: 'Profile', icon: CircleUser, path: '/profile' },
        { id: 'drivers', label: 'Drivers', icon: IdCard, path: '/drivers', badge: '9' },
        { id: 'vehicles', label: 'Vehicles', icon: Car, path: '/vehicle', badge: '6' },
        { id: 'documents', label: 'Documents', icon: FileText, path: '/documents', badge: '4' },
        { id: 'fares', label: 'Fares', icon: DollarSign, path: '/fares', badge: '3' },
        { id: 'geography', label: 'Geography', icon: Map, path: '/geography', badge: '10' },
    ];

    const sidebarVariants = {
        open: {
            x: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
            },
        },
        closed: {
            x: '-100%',
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
            },
        },
    };

    const itemVariants = {
        hover: {
            x: 4,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            transition: { duration: 0.2 },
        },
        active: {
            x: 4,
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
        },
    };

    return (
        <>
            {/* Overlay for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                variants={sidebarVariants}
                animate={isOpen ? 'open' : 'closed'}
                className="fixed lg:static w-70 h-full bg-white shadow-xl flex flex-col z-30"
            >
                {/* Logo Section */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                                <Shield className="text-white" size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
                                <p className="text-xs text-gray-500">Management System</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Users className="text-emerald-600" size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-700">
                                {user ? `${user.firstName} ${user.lastName}` : 'Admin User'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {user?.email || 'admin@admin.dev.cm'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);

                        return (
                            <motion.div
                                key={item.id}
                                variants={itemVariants}
                                whileHover="hover"
                                animate={isActive ? 'active' : 'default'}
                                className="relative overflow-hidden"
                            >
                                <Link
                                    to={item.path}
                                    onClick={() => {
                                        onNavigate(item.id);
                                        onClose();
                                    }}
                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:text-emerald-600 transition-colors"
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute left-0 top-0 h-full w-1 bg-emerald-500"
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <Icon size={20} />
                                    <span className="flex-1 text-left">{item.label}</span>
                                    {item.badge && (
                                        <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-1 rounded-full font-semibold">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </motion.div>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-200">
                    <motion.button
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={logout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </motion.button>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
