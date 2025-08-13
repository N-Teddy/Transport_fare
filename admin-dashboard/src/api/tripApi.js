import { ApiClient } from '../providers/AxiosClient';


const tripApi = {
    createTrip: (tripData) =>
        ApiClient.post('/trip', tripData).then(res => res.data),

    endTrip: (tripData) =>
        ApiClient.post('/trip/end', tripData).then(res => res.data),

    getTrips: (params) =>
        ApiClient.get('/trip', { params }).then(res => res.data),

    addGpsLog: (gpsLogData) =>
        ApiClient.post('/trip/gps', gpsLogData).then(res => res.data),

    addGpsLogs: (gpsLogsData) =>
        ApiClient.post('/trip/gps/batch', gpsLogsData).then(res => res.data),

    getTripById: (id) =>
        ApiClient.get(`/trip/${id}`).then(res => res.data),

    getGpsLogs: (id) =>
        ApiClient.get(`/trip/${id}/gps`).then(res => res.data),

    getTripStats: () =>
        ApiClient.get('/trip/stats/overall').then(res => res.data),

    getDriverTripStats: (driverId) =>
        ApiClient.get(`/trip/stats/driver/${driverId}`).then(res => res.data),

    getVehicleTripStats: (vehicleId) =>
        ApiClient.get(`/trip/stats/vehicle/${vehicleId}`).then(res => res.data),

    getDailyTripStats: (startDate, endDate) =>
        ApiClient.get('/trip/stats/daily', { params: { startDate, endDate } }).then(res => res.data),
};

export default tripApi;
