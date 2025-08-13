import React from 'react';
import { motion } from 'framer-motion';
import Skeleton from './Skeleton';

const DocumentSkeleton = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Statistics Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton variant="circle" className="w-12 h-12" />
                        </div>
                        <Skeleton variant="text" className="w-24 h-4 mb-2" />
                        <Skeleton variant="text" className="w-16 h-8" />
                    </motion.div>
                ))}
            </div>

            {/* Queue Status Skeleton */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-lg p-6"
            >
                <Skeleton variant="text" className="w-48 h-6 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Skeleton variant="text" className="w-24 h-4" />
                                <Skeleton variant="text" className="w-12 h-4 rounded-full" />
                            </div>
                            <Skeleton variant="text" className="w-8 h-8 mb-1" />
                            <Skeleton variant="text" className="w-20 h-3" />
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Filters Skeleton */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-6"
            >
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <Skeleton variant="text" className="flex-1 min-w-64 h-10 rounded-lg" />
                    <Skeleton variant="text" className="w-32 h-10 rounded-lg" />
                    <Skeleton variant="text" className="w-32 h-10 rounded-lg" />
                    <Skeleton variant="text" className="w-32 h-10 rounded-lg" />
                </div>
                <div className="flex flex-wrap gap-2">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} variant="text" className="w-24 h-6 rounded-full" />
                    ))}
                </div>
            </motion.div>

            {/* Table Skeleton */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
                <div className="p-6">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                {[...Array(8)].map((_, i) => (
                                    <th key={i} className="px-4 py-3">
                                        <Skeleton variant="text" className="h-4" />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, rowIndex) => (
                                <tr key={rowIndex} className="border-b">
                                    {[...Array(8)].map((_, colIndex) => (
                                        <td key={colIndex} className="px-4 py-3">
                                            <Skeleton variant="text" className="h-4" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Skeleton */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <Skeleton variant="text" className="w-32 h-4" />
                        <div className="flex items-center space-x-2">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} variant="text" className="w-16 h-8 rounded" />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DocumentSkeleton;
