// src/api/geographyApi.ts
import { ApiClient } from '../providers/AxiosClient';

// ========== REGION API ==========
export const geographyApi = {
    // Regions
    createRegion: (data) => ApiClient.post('/geography/regions', data),
    getRegions: (params) => ApiClient.get('/geography/regions', { params }),
    getRegionById: (id) => ApiClient.get(`/geography/regions/${id}`),
    getRegionWithCities: (id) => ApiClient.get(`/geography/regions/${id}/cities`),
    updateRegion: (id, data) => ApiClient.patch(`/geography/regions/${id}`, data),
    deleteRegion: (id) => ApiClient.delete(`/geography/regions/${id}`),

    // Cities
    createCity: (data) => ApiClient.post('/geography/cities', data),
    getCities: (params) => ApiClient.get('/geography/cities', { params }),
    getMajorCities: () => ApiClient.get('/geography/cities/major'),
    getCityById: (id) => ApiClient.get(`/geography/cities/${id}`),
    getCitiesByRegion: (regionId) =>
        ApiClient.get(`/geography/regions/${regionId}/cities`),
    updateCity: (id, data) => ApiClient.patch(`/geography/cities/${id}`, data),
    deleteCity: (id) => ApiClient.delete(`/geography/cities/${id}`),

    // Stats
    getGeographyStats: () => ApiClient.get('/geography/stats'),
};
