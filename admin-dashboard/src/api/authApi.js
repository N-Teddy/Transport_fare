import { ApiClient } from '../providers/AxiosClient';


const authApi = {
    login: (credentials) => ApiClient.post('/auth/login', credentials).then(res => res.data),
    register: (userData) => ApiClient.post('/auth/register', userData).then(res => res.data),
    refreshToken: (token) =>
        ApiClient.post('/auth/refresh-token', { refreshToken: token }).then(res => res.data),
    forgotPassword: (email) =>
        ApiClient.post('/auth/forgot-password', { email }).then(res => res.data),
    resetPassword: (payload) => ApiClient.post('/auth/reset-password', payload).then(res => res.data),
    changePassword: (payload) => ApiClient.post('/auth/change-password', payload).then(res => res.data),
    getProfile: () => ApiClient.get('/auth/profile').then(res => res.data),
    updateProfile: (profileData) => ApiClient.patch('/auth/profile', profileData).then(res => res.data),
};

export default authApi;
