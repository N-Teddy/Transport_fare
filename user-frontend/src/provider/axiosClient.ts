// src/provider/axiosClient.ts

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        console.log('Response from:', response.config.url, response.data)
        return response
    },
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
        }
        return Promise.reject(error);
    }
);