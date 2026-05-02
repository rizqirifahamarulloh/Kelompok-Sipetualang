// frontend/src/features/profile/services/profileService.js
import api from '@/services/api';


export const profileService = {
    // Get profile (bisa pakai authService.getProfile juga)
    async getProfile() {
        const response = await api.get('/me');
        return response;
    },

    // Update profile
    async updateProfile(data) {
        const response = await api.put('/profile', data);
        return response;
    },

    // Update photo
    async updatePhoto(formData) {
        const response = await api.post('/profile/photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    },

    // Delete photo
    async deletePhoto() {
        const response = await api.delete('/profile/photo');
        return response;
    },

    // Update password
    async updatePassword(data) {
        const response = await api.put('/profile/password', data);
        return response;
    },

    // Upload KTP
    async uploadKTP(formData) {
        const response = await api.post('/upload-ktp', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response;
    },

    // Delete account
    async deleteAccount(password) {
        const response = await api.delete('/profile', { data: { password } });
        return response;
    },
};