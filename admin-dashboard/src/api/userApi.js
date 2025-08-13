import { ApiClient } from '../providers/AxiosClient';


const usersApi = {
    getUsers: (params) => ApiClient.get('/users', { params }).then(res => res.data),
    getUser: (id) => ApiClient.get(`/users/${id}`).then(res => res.data),
    createUser: (data) => ApiClient.post('/users', data).then(res => res.data),
    updateUser: (id, data) => ApiClient.patch(`/users/${id}`, data).then(res => res.data),
    changeUserPassword: (id, data) => ApiClient.patch(`/users/${id}/change-password`, data).then(res => res.data),
    toggleUserActive: (id) => ApiClient.patch(`/users/${id}/toggle-active`).then(res => res.data),
    deleteUser: (id) => ApiClient.delete(`/users/${id}`).then(res => res.data),
    getUserStats: () => ApiClient.get('/users/stats').then(res => res.data),
};

export default usersApi;
