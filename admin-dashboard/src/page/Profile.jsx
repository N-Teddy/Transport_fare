// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
    User,
    Camera,
    Shield,
    CheckCircle,
    Save,
    Lock,
    Menu,
    X
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useGetUser, useUpdateUser, useChangeUserPassword } from '../hook/userHook';
import { useRegions } from '../hook/geographyHook';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import Sidebar from '../components/Sidebar';

const Profile = () => {
    const { user } = useAuthContext();
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const [activeSection, setActiveSection] = useState('profile');

    // Form states
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        regionId: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // API hooks
    const { data: userData, isLoading: userLoading } = useGetUser(user?.id);
    const { data: regionsData } = useRegions({ limit: 10, page: 1 });
    const updateUserMutation = useUpdateUser();
    const changePasswordMutation = useChangeUserPassword();

    // Initialize form data when user data is loaded
    useEffect(() => {
        if (userData?.data) {
            setProfileData({
                firstName: userData.data.firstName || '',
                lastName: userData.data.lastName || '',
                username: userData.data.username || '',
                email: userData.data.email || '',
                phone: userData.data.phone || '',
                regionId: userData.data.regionId || ''
            });
        }
    }, [userData]);

    // Handle responsive sidebar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateUserMutation.mutateAsync({
                id: user?.id,
                data: profileData
            });
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            await changePasswordMutation.mutateAsync({
                id: user?.id,
                data: { newPassword: passwordData.newPassword }
            });
            toast.success('Password updated successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast.error('Failed to update password');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getInitials = () => {
        if (userData?.data) {
            const first = userData.data.firstName?.charAt(0) || '';
            const last = userData.data.lastName?.charAt(0) || '';
            return (first + last).toUpperCase() || 'U';
        }
        return 'U';
    };

    const getRoleBadgeColor = (role) => {
        return role === 'admin'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-orange-100 text-orange-800';
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                activeSection={activeSection}
                onNavigate={setActiveSection}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 flex-shrink-0">
                    <div className="px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                >
                                    <Menu size={20} />
                                </button>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">My Profile</h1>
                                    <p className="text-sm text-gray-500 mt-1">Manage your personal information and settings</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
                        {userLoading ? (
                            <div className="space-y-4">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="animate-pulse">
                                        <div className="h-24 w-24 bg-gray-200 rounded-full mb-4"></div>
                                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Profile Header Card */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                                    <div className="flex items-center space-x-6">
                                        <div className="relative">
                                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                                                <span className="text-3xl font-semibold text-emerald-600">{getInitials()}</span>
                                            </div>
                                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white hover:bg-emerald-600">
                                                <Camera size={16} />
                                            </button>
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {userData?.data?.firstName} {userData?.data?.lastName}
                                            </h2>
                                            <p className="text-gray-600">{userData?.data?.email}</p>
                                            <div className="flex items-center space-x-4 mt-3">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(userData?.data?.role)}`}>
                                                    <Shield size={12} className="mr-1" />
                                                    {userData?.data?.role}
                                                </span>
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle size={12} className="mr-1" />
                                                    {userData?.data?.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    Member since {userData?.data?.createdAt && format(new Date(userData.data.createdAt), 'MMMM dd, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Personal Information */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                            <div className="px-6 py-4 border-b border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                                            </div>
                                            <div className="p-6">
                                                <form onSubmit={handleProfileUpdate} className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                                            <input
                                                                type="text"
                                                                name="firstName"
                                                                value={profileData.firstName}
                                                                onChange={handleInputChange}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                                            <input
                                                                type="text"
                                                                name="lastName"
                                                                value={profileData.lastName}
                                                                onChange={handleInputChange}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                                        <input
                                                            type="text"
                                                            name="username"
                                                            value={profileData.username}
                                                            onChange={handleInputChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={profileData.email}
                                                            onChange={handleInputChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                                        <input
                                                            type="tel"
                                                            name="phone"
                                                            value={profileData.phone}
                                                            onChange={handleInputChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                                                        <select
                                                            name="regionId"
                                                            value={profileData.regionId}
                                                            onChange={handleInputChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                                        >
                                                            <option value="">All Regions</option>
                                                            {regionsData?.data?.items?.map(region => (
                                                                <option key={region.id} value={region.id}>
                                                                    {region.name} ({region.code})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="flex justify-end space-x-3 pt-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setProfileData({
                                                                    firstName: userData?.data?.firstName || '',
                                                                    lastName: userData?.data?.lastName || '',
                                                                    username: userData?.data?.username || '',
                                                                    email: userData?.data?.email || '',
                                                                    phone: userData?.data?.phone || '',
                                                                    regionId: userData?.data?.regionId || ''
                                                                });
                                                            }}
                                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={updateUserMutation.isLoading}
                                                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 flex items-center space-x-2"
                                                        >
                                                            <Save size={16} />
                                                            <span>{updateUserMutation.isLoading ? 'Saving...' : 'Save Changes'}</span>
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>

                                        {/* Security Settings */}
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                            <div className="px-6 py-4 border-b border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                                            </div>
                                            <div className="p-6">
                                                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                                        <input
                                                            type="password"
                                                            name="currentPassword"
                                                            value={passwordData.currentPassword}
                                                            onChange={handlePasswordChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                                        <input
                                                            type="password"
                                                            name="newPassword"
                                                            value={passwordData.newPassword}
                                                            onChange={handlePasswordChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                                        <input
                                                            type="password"
                                                            name="confirmPassword"
                                                            value={passwordData.confirmPassword}
                                                            onChange={handlePasswordChange}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end space-x-3 pt-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setPasswordData({
                                                                    currentPassword: '',
                                                                    newPassword: '',
                                                                    confirmPassword: ''
                                                                });
                                                            }}
                                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={changePasswordMutation.isLoading}
                                                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 flex items-center space-x-2"
                                                        >
                                                            <Lock size={16} />
                                                            <span>{changePasswordMutation.isLoading ? 'Updating...' : 'Update Password'}</span>
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
