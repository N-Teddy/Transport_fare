import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    gradient,
    delay = 0
}) => {
    const gradients = {
        emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
        purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
        rose: 'bg-gradient-to-br from-rose-500 to-rose-600',
        amber: 'bg-gradient-to-br from-amber-500 to-amber-600',
        teal: 'bg-gradient-to-br from-teal-500 to-teal-600',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{
                y: -5,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${gradients[gradient]} rounded-lg flex items-center justify-center`}>
                    <Icon className="text-white" size={24} />
                </div>
                {trend && (
                    <span className={`text-sm font-semibold ${trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                        {trend}
                    </span>
                )}
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <motion.p
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: delay + 0.2, duration: 0.6 }}
                className="text-2xl font-bold text-gray-800"
            >
                {value}
            </motion.p>
            {subtitle && (
                <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
            )}
        </motion.div>
    );
};

export default StatCard;
