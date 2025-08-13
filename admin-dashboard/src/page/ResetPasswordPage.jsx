import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, Shield, CheckCircle, RefreshCw } from 'lucide-react';
import { useResetPassword } from '../hook/authHook';
import { resetPasswordSchema } from '../utils/validationSchemas';
import toast from 'react-hot-toast';
import adminBg from '../assets/admin-bg.svg';

const ResetPasswordPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const resetPasswordMutation = useResetPassword();

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            toast.error('Invalid or missing reset token');
            navigate('/forgot-password');
        }
    }, [token, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            token: token || ''
        }
    });

    const onSubmit = (data) => {
        resetPasswordMutation.mutate(data, {
            onSuccess: () => {
                toast.success('Password reset successful! Please login with your new password.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            },
            onError: (error) => {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password';
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

    const passwordRequirements = [
        { text: 'At least 8 characters long', regex: /.{8,}/ },
        { text: 'Contains uppercase letter', regex: /[A-Z]/ },
        { text: 'Contains lowercase letter', regex: /[a-z]/ },
        { text: 'Contains a number', regex: /[0-9]/ },
        { text: 'Contains special character', regex: /[!@#$%^&*]/ }
    ];

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
                                <RefreshCw className="w-12 h-12" />
                            </div>
                        </motion.div>

                        <motion.h1
                            className="text-6xl font-bold mb-6 leading-tight"
                            variants={itemVariants}
                        >
                            Reset Your
                            <br />
                            <span className="text-emerald-200">Password</span>
                        </motion.h1>

                        <motion.p
                            className="text-xl opacity-90 max-w-md mx-auto leading-relaxed"
                            variants={itemVariants}
                        >
                            Create a strong new password to secure your admin account and protect your data.
                        </motion.p>

                        {/* Password Tips */}
                        <motion.div
                            className="mt-16 space-y-4 text-left max-w-sm mx-auto"
                            variants={itemVariants}
                        >
                            <h3 className="text-lg font-semibold mb-3">Strong Password Tips:</h3>
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs">1</span>
                                </div>
                                <span className="text-sm">Use a mix of letters, numbers, and symbols</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs">2</span>
                                </div>
                                <span className="text-sm">Avoid common words or personal information</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs">3</span>
                                </div>
                                <span className="text-sm">Make it unique from your other passwords</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Side - Reset Password Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
                <motion.div
                    className="w-full max-w-md"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                        {/* Header */}
                        <motion.div className="text-center mb-8" variants={itemVariants}>
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4 shadow-lg">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">Set New Password</h2>
                            <p className="text-gray-600 mt-2">Please enter your new password below</p>
                        </motion.div>

                        {/* Reset Password Form */}
                        <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-6" variants={itemVariants}>
                            <input type="hidden" {...register('token')} value={token || ''} />

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('newPassword')}
                                        className={`w-full px-4 py-3 pl-11 pr-11 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.newPassword ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter new password"
                                    />
                                    <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <motion.p
                                        className="text-red-500 text-sm"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {errors.newPassword.message}
                                    </motion.p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        {...register('confirmPassword')}
                                        className={`w-full px-4 py-3 pl-11 pr-11 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Confirm new password"
                                    />
                                    <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <motion.p
                                        className="text-red-500 text-sm"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {errors.confirmPassword.message}
                                    </motion.p>
                                )}
                            </div>

                            {/* Password Requirements */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                                <ul className="space-y-1">
                                    {passwordRequirements.map((req, index) => (
                                        <li key={index} className="flex items-center text-xs text-gray-600">
                                            <CheckCircle className="w-3 h-3 mr-2 text-emerald-500" />
                                            {req.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={isSubmitting || resetPasswordMutation.isPending}
                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                whileHover={{ y: -2, boxShadow: "0 10px 20px rgba(16, 185, 129, 0.3)" }}
                                whileTap={{ y: 0 }}
                            >
                                {isSubmitting || resetPasswordMutation.isPending ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Resetting Password...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <RefreshCw className="w-5 h-5 mr-2" />
                                        Reset Password
                                    </div>
                                )}
                            </motion.button>
                        </motion.form>

                        {/* Additional Links */}
                        <motion.div className="mt-8 text-center" variants={itemVariants}>
                            <p className="text-gray-600">
                                Remember your password?{' '}
                                <Link
                                    to="/login"
                                    className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                                >
                                    Back to login
                                </Link>
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
