// src/components/UserManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Users,
    UserCheck,
    Shield,
    Eye,
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    X,
    Menu,
    ChevronLeft,
    ChevronRight,
    ToggleLeft,
    ToggleRight,
    AlertCircle,
    Lock
} from 'lucide-react';
import {
    useGetUsers,
    useGetUser,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    useToggleUserActive,
    useGetUserStats,
    useChangeUserPassword
} from '../hook/userHook';
import { useRegions } from '../hook/geographyHook';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import Sidebar from '../components/Sidebar';

const UserManagement = () => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
    const [activeSection, setActiveSection] = useState('users');

    // Filter states - initialize with undefined/empty values
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10
    });

    // Search form states (separate from actual filters)
    const [searchForm, setSearchForm] = useState({
        username: '',
        email: '',
        role: '',
        regionId: '',
        isActive: ''
    });

    // Modal states
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        role: 'viewer',
        regionId: '',
        isActive: true,
        password: ''
    });

    const [newPassword, setNewPassword] = useState('');

    // Build clean filters object - only include non-empty values
    const cleanFilters = useMemo(() => {
        const cleaned = {
            page: filters.page,
            limit: filters.limit
        };

        // Only add filter properties if they have values
        if (searchForm.username?.trim()) {
            cleaned.username = searchForm.username.trim();
        }
        if (searchForm.email?.trim()) {
            cleaned.email = searchForm.email.trim();
        }
        if (searchForm.role) {
            cleaned.role = searchForm.role;
        }
        if (searchForm.regionId) {
            cleaned.regionId = searchForm.regionId;
        }
        if (searchForm.isActive !== '') {
            cleaned.isActive = searchForm.isActive === 'true';
        }

        return cleaned;
    }, [filters.page, filters.limit, searchForm]);

    // API hooks - use cleaned filters
    const { data: usersData, isLoading: usersLoading } = useGetUsers(cleanFilters);
    const { data: userStats } = useGetUserStats();
    const { data: regionsData } = useRegions({ limit: 100 });
    const { data: selectedUserData } = useGetUser(selectedUser?.id);

    // Mutations
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();
    const toggleUserActiveMutation = useToggleUserActive();
    const changePasswordMutation = useChangeUserPassword();

    // Memoized data
    const users = useMemo(() => usersData?.data?.items || [], [usersData]);
    const pagination = useMemo(() => usersData?.data?.pagination || {}, [usersData]);
    const regions = useMemo(() => regionsData?.data?.items || [], [regionsData]);

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

    // Update form data when editing
    useEffect(() => {
        if (editModalOpen && selectedUserData?.data) {
            setFormData({
                firstName: selectedUserData.data.firstName || '',
                lastName: selectedUserData.data.lastName || '',
                username: selectedUserData.data.username || '',
                email: selectedUserData.data.email || '',
                phone: selectedUserData.data.phone || '',
                role: selectedUserData.data.role || 'viewer',
                regionId: selectedUserData.data.regionId || '',
                isActive: selectedUserData.data.isActive || true,
                password: ''
            });
        }
    }, [editModalOpen, selectedUserData]);

    // Handlers
    const handleSearchFormChange = (key, value) => {
        setSearchForm(prev => ({ ...prev, [key]: value }));
    };

    const handleApplyFilters = () => {
        // Reset to page 1 when applying new filters
        setFilters({ page: 1, limit: filters.limit });
    };

    const handleClearFilters = () => {
        setSearchForm({
            username: '',
            email: '',
            role: '',
            regionId: '',
            isActive: ''
        });
        setFilters({ page: 1, limit: 10 });
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await createUserMutation.mutateAsync(formData);
            toast.success('User created successfully');
            setAddModalOpen(false);
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            const { password, ...updateData } = formData;
            await updateUserMutation.mutateAsync({
                id: selectedUser.id,
                data: updateData
            });
            toast.success('User updated successfully');
            setEditModalOpen(false);
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDeleteUser = async () => {
        try {
            await deleteUserMutation.mutateAsync(selectedUser.id);
            toast.success('User deleted successfully');
            setDeleteModalOpen(false);
            setSelectedUser(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleToggleActive = async (userId) => {
        try {
            await toggleUserActiveMutation.mutateAsync(userId);
            toast.success('User status updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user status');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            await changePasswordMutation.mutateAsync({
                id: selectedUser.id,
                data: { newPassword }
            });
            toast.success('Password changed successfully');
            setPasswordModalOpen(false);
            setNewPassword('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            phone: '',
            role: 'viewer',
            regionId: '',
            isActive: true,
            password: ''
        });
        setSelectedUser(null);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditModalOpen(true);
    };

    const openViewModal = (user) => {
        setSelectedUser(user);
        setViewModalOpen(true);
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    };

    const openPasswordModal = (user) => {
        setSelectedUser(user);
        setPasswordModalOpen(true);
    };

    const getInitials = (firstName, lastName) => {
        const first = firstName?.charAt(0) || '';
        const last = lastName?.charAt(0) || '';
        return (first + last).toUpperCase() || 'U';
    };

    const getRoleBadgeColor = (role) => {
        return role === 'admin'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-orange-100 text-orange-800';
    };

    const getRegionName = (regionId) => {
        const region = regions.find(r => r.id === regionId);
        return region ? `${region.name} (${region.code})` : 'No Region';
    };

    // Check if any filters are active
    const hasActiveFilters = searchForm.username || searchForm.email || searchForm.role || searchForm.regionId || searchForm.isActive;

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
                                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">User Management</h1>
                                    <p className="text-sm text-gray-500 mt-1">Manage users and their roles</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                                        <p className="text-2xl font-semibold text-gray-900 mt-2">
                                            {userStats?.data?.totalUsers || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">All registered users</p>
                                    </div>
                                    <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                                        <Users size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Active Users</p>
                                        <p className="text-2xl font-semibold text-gray-900 mt-2">
                                            {userStats?.data?.activeUsers || 0}
                                        </p>
                                        <p className="text-xs text-emerald-600 mt-2">
                                            {userStats?.data?.totalUsers > 0
                                                ? `${Math.round((userStats.data.activeUsers / userStats.data.totalUsers) * 100)}% active`
                                                : '0% active'}
                                        </p>
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg">
                                        <UserCheck size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Admins</p>
                                        <p className="text-2xl font-semibold text-gray-900 mt-2">
                                            {userStats?.data?.usersByRole?.admin || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">System administrators</p>
                                    </div>
                                    <div className="bg-purple-50 text-purple-600 p-3 rounded-lg">
                                        <Shield size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Viewers</p>
                                        <p className="text-2xl font-semibold text-gray-900 mt-2">
                                            {userStats?.data?.usersByRole?.viewer || 0}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">Read-only access</p>
                                    </div>
                                    <div className="bg-orange-50 text-orange-600 p-3 rounded-lg">
                                        <Eye size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                            <div className="flex flex-wrap gap-3 items-center justify-between">
                                <div className="flex flex-wrap gap-3 flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search by username..."
                                        value={searchForm.username}
                                        onChange={(e) => handleSearchFormChange('username', e.target.value)}
                                        className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search by email..."
                                        value={searchForm.email}
                                        onChange={(e) => handleSearchFormChange('email', e.target.value)}
                                        className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                    <select
                                        value={searchForm.role}
                                        onChange={(e) => handleSearchFormChange('role', e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">All Roles</option>
                                        <option value="admin">Admin</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                    <select
                                        value={searchForm.regionId}
                                        onChange={(e) => handleSearchFormChange('regionId', e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">All Regions</option>
                                        {regions.map(region => (
                                            <option key={region.id} value={region.id}>
                                                {region.name} ({region.code})
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        value={searchForm.isActive}
                                        onChange={(e) => handleSearchFormChange('isActive', e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">All Status</option>
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                    <button
                                        onClick={handleApplyFilters}
                                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center space-x-2"
                                    >
                                        <Filter size={16} />
                                        <span>Apply</span>
                                    </button>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => setAddModalOpen(true)}
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center space-x-2"
                                >
                                    <Plus size={16} />
                                    <span>Add User</span>
                                </button>
                            </div>
                            {hasActiveFilters && (
                                <div className="mt-3 text-sm text-gray-600">
                                    Active filters:
                                    {searchForm.username && <span className="ml-2 px-2 py-1 bg-gray-100 rounded">Username: {searchForm.username}</span>}
                                    {searchForm.email && <span className="ml-2 px-2 py-1 bg-gray-100 rounded">Email: {searchForm.email}</span>}
                                    {searchForm.role && <span className="ml-2 px-2 py-1 bg-gray-100 rounded">Role: {searchForm.role}</span>}
                                    {searchForm.regionId && <span className="ml-2 px-2 py-1 bg-gray-100 rounded">Region: {getRegionName(searchForm.regionId)}</span>}
                                    {searchForm.isActive && <span className="ml-2 px-2 py-1 bg-gray-100 rounded">Status: {searchForm.isActive === 'true' ? 'Active' : 'Inactive'}</span>}
                                </div>
                            )}
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {usersLoading ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-8">
                                                    <div className="flex justify-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                                                    </div>
                                                    <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                                                </td>
                                            </tr>
                                        ) : users.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-8">
                                                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                                                    <p className="mt-2 text-sm text-gray-500">No users found</p>
                                                    {hasActiveFilters && (
                                                        <button
                                                            onClick={handleClearFilters}
                                                            className="mt-2 text-sm text-emerald-600 hover:text-emerald-700"
                                                        >
                                                            Clear filters
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ) : (
                                            users.map(user => (
                                                <tr key={user.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                                                <span className="text-emerald-600 font-semibold">
                                                                    {getInitials(user.firstName, user.lastName)}
                                                                </span>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {user.firstName} {user.lastName}
                                                                </div>
                                                                <div className="text-sm text-gray-500">@{user.username}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm text-gray-900">{user.email}</div>
                                                            <div className="text-sm text-gray-500">{user.phone}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                            {user.role === 'admin' && <Shield size={12} className="mr-1" />}
                                                            {user.role === 'viewer' && <Eye size={12} className="mr-1" />}
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-900">
                                                            {getRegionName(user.regionId)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {user.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button
                                                                onClick={() => openEditModal(user)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="Edit user"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => openViewModal(user)}
                                                                className="text-emerald-600 hover:text-emerald-900"
                                                                title="View details"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => openPasswordModal(user)}
                                                                className="text-gray-600 hover:text-gray-900"
                                                                title="Change password"
                                                            >
                                                                <Lock size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleActive(user.id)}
                                                                className={`${user.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                                                                title={user.isActive ? 'Deactivate user' : 'Activate user'}
                                                                disabled={toggleUserActiveMutation.isLoading}
                                                            >
                                                                {user.isActive ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                                                            </button>
                                                            <button
                                                                onClick={() => openDeleteModal(user)}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Delete user"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {!usersLoading && users.length > 0 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                                        <span className="font-medium">
                                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                                        </span> of{' '}
                                        <span className="font-medium">{pagination.total}</span> results
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={!pagination.hasPrev}
                                            className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="px-3 py-1 text-sm">
                                            Page {pagination.page} of {pagination.totalPages}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={!pagination.hasNext}
                                            className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {addModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
                            <button onClick={() => setAddModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                                <select
                                    name="regionId"
                                    value={formData.regionId}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                >
                                    <option value="">Select Region</option>
                                    {regions.map(region => (
                                        <option key={region.id} value={region.id}>
                                            {region.name} ({region.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setAddModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                                >
                                    Add User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit User Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
                            <button onClick={() => setEditModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEditUser} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                                <select
                                    name="regionId"
                                    value={formData.regionId}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                >
                                    <option value="">Select Region</option>
                                    {regions.map(region => (
                                        <option key={region.id} value={region.id}>
                                            {region.name} ({region.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                                >
                                    Update User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* View User Modal */}
            {viewModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">User  Details</h3>
                            <button onClick={() => setViewModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-                            900">First Name: <span className="font-normal">{selectedUser.firstName}</span></p>
                            <p className="text-sm font-medium text-gray-900">Last Name: <span className="font-normal">{selectedUser.lastName}</span></p>
                            <p className="text-sm font-medium text-gray-900">Username: <span className="font-normal">{selectedUser.username}</span></p>
                            <p className="text-sm font-medium text-gray-900">Email: <span className="font-normal">{selectedUser.email}</span></p>
                            <p className="text-sm font-medium text-gray-900">Phone: <span className="font-normal">{selectedUser.phone}</span></p>
                            <p className="text-sm font-medium text-gray-900">Role: <span className="font-normal">{selectedUser.role}</span></p>
                            <p className="text-sm font-medium text-gray-900">Region: <span className="font-normal">{getRegionName(selectedUser.regionId)}</span></p>
                            <p className="text-sm font-medium text-gray-900">Status: <span className={`font-normal ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>{selectedUser.isActive ? 'Active' : 'Inactive'}</span></p>
                            <p className="text-sm font-medium text-gray-900">Last Login: <span className="font-normal">{selectedUser.lastLogin ? format(new Date(selectedUser.lastLogin), 'MMMM dd, yyyy') : 'N/A'}</span></p>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                onClick={() => setViewModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete User Modal */}
            {deleteModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                            <button onClick={() => setDeleteModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-gray-700">Are you sure you want to delete the user <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>? This action cannot be undone.</p>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Change Password Modal */}
            {passwordModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                            <button onClick={() => setPasswordModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setPasswordModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                                >
                                    Change Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
