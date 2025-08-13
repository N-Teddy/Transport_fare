import { motion } from 'framer-motion';
import Skeleton from './Skeleton';

const DashboardSkeleton = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Key Metrics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton variant="circle" className="w-12 h-12" />
                            <Skeleton variant="text" className="w-12 h-4" />
                        </div>
                        <Skeleton variant="text" className="w-20 h-4 mb-2" />
                        <Skeleton variant="text" className="w-16 h-8 mb-2" />
                        <Skeleton variant="text" className="w-24 h-3" />
                    </motion.div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="bg-white rounded-xl shadow-lg p-6"
                    >
                        <Skeleton variant="text" className="w-32 h-6 mb-4" />
                        <Skeleton variant="default" className="w-full h-64 rounded-lg" />
                    </motion.div>
                ))}
            </div>

            {/* Additional Stats Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                        className="bg-white rounded-xl shadow-lg p-6"
                    >
                        <Skeleton variant="text" className="w-24 h-6 mb-4" />
                        <div className="space-y-3">
                            {[...Array(4)].map((_, j) => (
                                <div key={j} className="flex justify-between items-center">
                                    <Skeleton variant="text" className="w-20 h-4" />
                                    <Skeleton variant="text" className="w-8 h-4" />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Table Skeleton */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="bg-white rounded-xl shadow-lg p-6"
            >
                <Skeleton variant="text" className="w-32 h-6 mb-4" />
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="grid grid-cols-5 gap-4">
                            {[...Array(5)].map((_, j) => (
                                <Skeleton key={j} variant="text" className="h-4" />
                            ))}
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DashboardSkeleton;
