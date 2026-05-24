// frontend/src/services/notificationService.js
import api from '@/services/api';

export const notificationService = {
  // Get all notifications for current user
  async getNotifications() {
    const response = await api.get('/notifikasi');
    return response.data;
  }
};
