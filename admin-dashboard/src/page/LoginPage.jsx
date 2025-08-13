import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, User, Lock, Shield, CheckCircle, LogIn } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { loginSchema } from '../utils/validationSchemas';
import toast from 'react-hot-toast';
import adminBg from '../assets/admin-bg.svg';
import { useLogin } from '../hook/authHook'

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuthContext();
    const loginMutation = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = (data) => {
        loginMutation.mutate(data, {
            onSuccess: (response) => {
                const { data: responseData } = response;
                login(responseData.user, responseData.tokens);
                toast.success('Login successful!');
                navigate('/dashboard');
            },
            onError: (error) => {
                const errorMessage = error.response?.data?.message || error.message || 'Login failed';
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

    const heroVariants = {
        hidden: { opacity: 0, x: -30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.7, ease: "easeOut" }
        }
    };

    const inputVariants = {
        focus: {
            y: -2,
            transition: { duration: 0.2 }
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
                initial="hidden"
                animate="visible"
                variants={heroVariants}
            >
                <div className="flex items-center justify-center p-12 relative z-10 w-full">
                    <motion.div
                        className="text-white text-center"
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
                                <Shield className="w-12 h-12" />
                            </div>
                        </motion.div>

                        <motion.h1
                            className="text-6xl font-bold mb-6 leading-tight"
                            variants={itemVariants}
                        >
                            Admin
                            <br />
                            <span className="text-emerald-200">Portal</span>
                        </motion.h1>

                        <motion.p
                            className="text-xl opacity-90 max-w-md mx-auto leading-relaxed"
                            variants={itemVariants}
                        >
                            Secure access to your administrative dashboard. Manage your system with confidence and control.
                        </motion.p>

                        {/* Feature Stats */}
                        <motion.div
                            className="mt-16 grid grid-cols-3 gap-8"
                            variants={itemVariants}
                        >
                            <div className="text-center">
                                <div className="text-3xl font-bold mb-2">99.9%</div>
                                <div className="text-sm opacity-75">Uptime</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold mb-2">256-bit</div>
                                <div className="text-sm opacity-75">Encryption</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold mb-2">24/7</div>
                                <div className="text-sm opacity-75">Support</div>
                            </div>
                        </motion.div>

                        {/* Decorative Elements */}
                        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
                <motion.div
                    className="w-full max-w-md"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                        {/* Logo/Header */}
                        <motion.div className="text-center mb-8" variants={itemVariants}>
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4 shadow-lg">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                            <p className="text-gray-600 mt-2">Sign in to your admin account</p>
                        </motion.div>

                        {/* Login Form */}
                        <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-6" variants={itemVariants}>
                            {/* Username Field */}
                            <motion.div className="space-y-2" variants={inputVariants} whileFocus="focus">
                                <label className="block text-sm font-medium text-gray-700">Username</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        {...register('username')}
                                        className={`w-full px-4 py-3 pl-11 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.username ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter your username"
                                    />
                                    <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                                {errors.username && (
                                    <motion.p
                                        className="text-red-500 text-sm"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {errors.username.message}
                                    </motion.p>
                                )}
                            </motion.div>

                            {/* Password Field */}
                            <motion.div className="space-y-2" variants={inputVariants} whileFocus="focus">
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password')}
                                        className={`w-full px-4 py-3 pl-11 pr-11 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.password ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter your password"
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
                                {errors.password && (
                                    <motion.p
                                        className="text-red-500 text-sm"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {errors.password.message}
                                    </motion.p>
                                )}
                            </motion.div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={isSubmitting || loginMutation.isPending}
                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                whileHover={{ y: -2, boxShadow: "0 10px 20px rgba(16, 185, 129, 0.3)" }}
                                whileTap={{ y: 0 }}
                            >
                                {isSubmitting || loginMutation.isPending ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Signing In...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <LogIn className="w-5 h-5 mr-2" />
                                        Sign In
                                    </div>
                                )}
                            </motion.button>
                        </motion.form>

                        {/* Register Link */}
                        <motion.div className="mt-8 text-center" variants={itemVariants}>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
                                </div>
                            </div>
                            <Link
                                to="/register"
                                className="mt-4 w-full inline-flex items-center justify-center border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 py-2 px-4 rounded-lg font-medium transition-all duration-200"
                            >
                                Create Admin Account
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
