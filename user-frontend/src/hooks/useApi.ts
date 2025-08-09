import { apiClient } from '../provider/axiosClient';

export function useApi() {
    return apiClient;
}