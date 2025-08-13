import { motion } from 'framer-motion';

const Skeleton = ({ className = '', variant = 'default', ...props }) => {
    const variants = {
        default: 'bg-gray-200',
        card: 'bg-gray-100 rounded-lg',
        text: 'bg-gray-200 rounded',
        circle: 'bg-gray-200 rounded-full',
    };

    return (
        <motion.div
            className={`animate-pulse ${variants[variant]} ${className}`}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            transition={{
                repeat: Infinity,
                repeatType: 'reverse',
                duration: 1,
            }}
            {...props}
        />
    );
};

export default Skeleton;
