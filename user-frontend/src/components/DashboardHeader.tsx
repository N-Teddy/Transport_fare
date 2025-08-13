import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MapPin, Menu, Settings } from "lucide-react";
import { motion } from 'framer-motion';
import { cardAnimation, FareWayHeaderLogo } from "../pages/Dashboard";


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

export default DashboardHeader