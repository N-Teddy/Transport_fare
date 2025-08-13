import { ApiClient } from '../providers/AxiosClient';

const vehicleApi = {
    // VEHICLE TYPES
    getAllVehicleTypes: (params) =>
        ApiClient.get('/vehicles/types', { params }).then(res => res.data),

    getVehicleTypeById: (id) =>
        ApiClient.get(`/vehicles/types/${id}`).then(res => res.data),

    createVehicleType: (data) =>
        ApiClient.post('/vehicles/types', data).then(res => res.data),

    updateVehicleType: (id, data) =>
        ApiClient.patch(`/vehicles/types/${id}`, data).then(res => res.data),

    deleteVehicleType: (id) =>
        ApiClient.delete(`/vehicles/types/${id}`).then(res => res.data),

    getVehicleTypeStatistics: () =>
        ApiClient.get('/vehicles/types/statistics').then(res => res.data),

    // VEHICLES
    getAllVehicles: (params) =>
        ApiClient.get('/vehicles', { params }).then(res => res.data),

    getVehicleById: (id) =>
        ApiClient.get(`/vehicles/${id}`).then(res => res.data),

    createVehicle: (data) =>
        ApiClient.post('/vehicles', data).then(res => res.data),

    updateVehicle: (id, data) =>
        ApiClient.patch(`/vehicles/${id}`, data).then(res => res.data),

    deleteVehicle: (id) =>
        ApiClient.delete(`/vehicles/${id}`).then(res => res.data),

    getVehicleStatistics: () =>
        ApiClient.get('/vehicles/statistics').then(res => res.data),

    bulkUpdateVehicleStatus: (data) =>
        ApiClient.patch('/vehicles/bulk-status', data).then(res => res.data),

    bulkVerifyVehiclePhotos: (data) =>
        ApiClient.patch('/vehicles/bulk-verify-photos', data).then(res => res.data),
};

export default vehicleApi;
