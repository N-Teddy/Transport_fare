import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, Send, Key } from 'lucide-react';
import { forgotPasswordSchema } from '../utils/validationSchemas';
import toast from 'react-hot-toast';
import adminBg from '../assets/admin-bg.svg';
import { useForgotPassword } from '../hook/authHook';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const forgotPasswordMutation = useForgotPassword();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema)
    });

    const onSubmit = (data) => {
        forgotPasswordMutation.mutate(data, {
            onSuccess: (response) => {
                toast.success('Password reset instructions sent to your email!');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            },
            onError: (error) => {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset email';
                toast.error(errorMessage);
            }
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 to-teal-50">
            {/* Left Side - Hero/Branding */}
            <motion.div
                className="hidden lg:flex lg:flex-1 relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%), url(${adminBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
            >
                <div className="flex items-center justify-center p-12 relative z-10 w-full">
                    <motion.div
                        className="text-white text-center"
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        {/* Floating Icon */}
                        <motion.div
                            className="mb-8"
                            animate={{
                                y: [0, -10, 0],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full backdrop-blur-sm">
                                <Key className="w-12 h-12" />
                            </div>
                        </motion.div>

                        <motion.h1
                            className="text-6xl font-bold mb-6 leading-tight"
                            variants={itemVariants}
                        >
                            Password
                            <br />
                            <span className="text-emerald-200">Recovery</span>
                        </motion.h1>

                        <motion.p
                            className="text-xl opacity-90 max-w-md mx-auto leading-relaxed"
                            variants={itemVariants}
                        >
                            Don't worry! It happens. We'll help you reset your password and get back to your dashboard.
                        </motion.p>

                        {/* Security Features */}
                        <motion.div
                            className="mt-16 space-y-4 text-left max-w-sm mx-auto"
                            variants={itemVariants}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span>Secure password reset</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                </div>
                                <span>Email verification</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span>Time-limited reset link</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Side - Forgot Password Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
                <motion.div
                    className="w-full max-w-md"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                        {/* Back Button */}
                        <motion.div variants={itemVariants}>
                            <Link
                                to="/login"
                                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to login
                            </Link>
                        </motion.div>

                        {/* Header */}
                        <motion.div className="text-center mb-8" variants={itemVariants}>
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4 shadow-lg">
                                <Key className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">Forgot Password?</h2>
                            <p className="text-gray-600 mt-2">Enter your email to receive reset instructions</p>
                        </motion.div>

                        {/* Forgot Password Form */}
                        <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-6" variants={itemVariants}>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        {...register('email')}
                                        className={`w-full px-4 py-3 pl-11 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.email ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter your registered email"
                                    />
                                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                                {errors.email && (
                                    <motion.p
                                        className="text-red-500 text-sm"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {errors.email.message}
                                    </motion.p>
                                )}
                            </div>

                            {/* Info Message */}
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                <p className="text-sm text-emerald-800">
                                    We'll send you an email with instructions to reset your password. Please check your inbox and spam folder.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={isSubmitting || forgotPasswordMutation.isPending}
                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                whileHover={{ y: -2, boxShadow: "0 10px 20px rgba(16, 185, 129, 0.3)" }}
                                whileTap={{ y: 0 }}
                            >
                                {isSubmitting || forgotPasswordMutation.isPending ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Sending Instructions...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <Send className="w-5 h-5 mr-2" />
                                        Send Reset Instructions
                                    </div>
                                )}
                            </motion.button>
                        </motion.form>

                        {/* Additional Links */}
                        <motion.div className="mt-8 text-center space-y-2" variants={itemVariants}>
                            <p className="text-gray-600">
                                Remember your password?{' '}
                                <Link
                                    to="/login"
                                    className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                                >
                                    Sign in
                                </Link>
                            </p>
                            <p className="text-gray-600">
                                Don't have an account?{' '}
                                <Link
                                    to="/register"
                                    className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
