import { ApiClient } from '../providers/AxiosClient';


const driverApi = {
    createDriver: (data) => ApiClient.post('/drivers', data).then(res => res.data),
    getDrivers: (params) => ApiClient.get('/drivers', { params }).then(res => res.data),
    getDriverStats: () => ApiClient.get('/drivers/stats').then(res => res.data),
    getDriverById: (id) => ApiClient.get(`/drivers/${id}`).then(res => res.data),
    updateDriver: (id, data) => ApiClient.patch(`/drivers/${id}`, data).then(res => res.data),
    deleteDriver: (id) => ApiClient.delete(`/drivers/${id}`).then(res => res.data),
    updateDriverStatus: (id, data) => ApiClient.patch(`/drivers/${id}/status`, data).then(res => res.data),
    verifyDriverPhotos: (id, data) => ApiClient.patch(`/drivers/${id}/photos/verify`, data).then(res => res.data),

    getDriverRatings: (params) => ApiClient.get('/drivers/ratings', { params }).then(res => res.data),
    getDriverRatingById: (id) => ApiClient.get(`/drivers/ratings/${id}`).then(res => res.data),
    getRatingsByDriverId: (driverId) => ApiClient.get(`/drivers/${driverId}/ratings`).then(res => res.data),
    getDriverRatingStats: (driverId) => ApiClient.get(`/drivers/${driverId}/rating-stat`).then(res => res.data),
};

export default driverApi;
