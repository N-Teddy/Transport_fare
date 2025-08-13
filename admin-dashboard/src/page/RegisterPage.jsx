import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, User, Lock, Mail, Phone, MapPin, UserPlus, ChevronDown } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { registerSchema } from '../utils/validationSchemas';
import toast from 'react-hot-toast';
import { useRegister } from '../hook/authHook';
import { useRegions } from '../hook/geographyHook';
import adminBg from '../assets/admin-bg.svg'


const RegisterPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuthContext();
    const registerMutation = useRegister();
    const { data: regionsData, isLoading: regionsLoading } = useRegions({ limit: 100 });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(registerSchema)
    });

    const onSubmit = (data) => {
        const { confirmPassword, ...submitData } = data;
        const payload = {
            ...submitData,
            role: 'admin' // Always set role to admin
        };

        registerMutation.mutate(payload, {
            onSuccess: (response) => {
                const { data: responseData } = response;
                login(responseData.user, responseData.tokens);
                toast.success('Account created successfully!');
                navigate('/dashboard');
            },
            onError: (error) => {
                const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
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
                                <UserPlus className="w-12 h-12" />
                            </div>
                        </motion.div>

                        <motion.h1
                            className="text-6xl font-bold mb-6 leading-tight"
                            variants={itemVariants}
                        >
                            Join Our
                            <br />
                            <span className="text-emerald-200">Team</span>
                        </motion.h1>

                        <motion.p
                            className="text-xl opacity-90 max-w-md mx-auto leading-relaxed"
                            variants={itemVariants}
                        >
                            Create your admin account and start managing your region with powerful tools and insights.
                        </motion.p>

                        {/* Benefits */}
                        <motion.div
                            className="mt-16 space-y-4 text-left max-w-sm mx-auto"
                            variants={itemVariants}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span>Full administrative access</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span>Real-time analytics dashboard</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span>Secure data management</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span>24/7 technical support</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Side - Register Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
                <motion.div
                    className="w-full max-w-2xl"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                        {/* Header */}
                        <motion.div className="text-center mb-8" variants={itemVariants}>
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4 shadow-lg">
                                <UserPlus className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">Create Admin Account</h2>
                            <p className="text-gray-600 mt-2">Fill in your details to get started</p>
                        </motion.div>

                        {/* Register Form */}
                        <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-6" variants={itemVariants}>
                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        {...register('firstName')}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.firstName ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="John"
                                    />
                                    {errors.firstName && (
                                        <motion.p
                                            className="text-red-500 text-sm"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            {errors.firstName.message}
                                        </motion.p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        {...register('lastName')}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.lastName ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Doe"
                                    />
                                    {errors.lastName && (
                                        <motion.p
                                            className="text-red-500 text-sm"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            {errors.lastName.message}
                                        </motion.p>
                                    )}
                                </div>
                            </div>

                            {/* Username and Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Username</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            {...register('username')}
                                            className={`w-full px-4 py-3 pl-11 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.username ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder="johndoe"
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
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            {...register('email')}
                                            className={`w-full px-4 py-3 pl-11 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.email ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder="john@example.com"
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
                            </div>

                            {/* Phone and Region */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <div className="relative">
                                        <input
                                            type="tel"
                                            {...register('phone')}
                                            className={`w-full px-4 py-3 pl-11 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.phone ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder="673710999"
                                        />
                                        <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                    {errors.phone && (
                                        <motion.p
                                            className="text-red-500 text-sm"
                                            initial={{ opacity: 0, y: -10 }}
                                                              animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.phone.message}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Region</label>
                  <div className="relative">
                    <select
                      {...register('regionId')}
                      className={`w-full px-4 py-3 pl-11 pr-10 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none ${
                        errors.regionId ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={regionsLoading}
                    >
                      <option value="">Select a region</option>
                      {regionsData?.items?.map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.name} - {region.capitalCity}
                        </option>
                      ))}
                    </select>
                    <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.regionId && (
                    <motion.p
                      className="text-red-500 text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {errors.regionId.message}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Password Fields */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className={`w-full px-4 py-3 pl-11 pr-11 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
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
                <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
                {errors.password && (
                  <motion.p
                    className="text-red-500 text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className={`w-full px-4 py-3 pl-11 pr-11 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
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

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting || registerMutation.isPending}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                whileHover={{ y: -2, boxShadow: "0 10px 20px rgba(16, 185, 129, 0.3)" }}
                whileTap={{ y: 0 }}
              >
                {isSubmitting || registerMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </div>
                )}
              </motion.button>
            </motion.form>

            {/* Login Link */}
            <motion.div className="mt-6 text-center" variants={itemVariants}>
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
