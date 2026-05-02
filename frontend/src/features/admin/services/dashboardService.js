// frontend/src/features/admin/services/dashboardService.js
import api from '@/services/api';

export const dashboardService = {
    async getStats() {
        const response = await api.get('/admin/dashboard');
        return response;
    },
    
    async getUsers(params) {
        const response = await api.get('/admin/users', { params });
        return response;
    },
    
    async getPendingKTP(params) {
        const response = await api.get('/admin/pending-ktp', { params });
        return response;
    },
    
    async verifyKTP(data) {
        const response = await api.post('/admin/verify-ktp', data);
        return response;
    }
};