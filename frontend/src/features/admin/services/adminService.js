// frontend/src/features/admin/services/adminService.js
import api from '@/services/api'

export const adminService = {
  // Get all users
  async getUsers(params) {
    const response = await api.get('/admin/users', { params })
    return response
  },

  // Get user by ID
  async getUserById(id) {
    const response = await api.get(`/admin/users/${id}`)
    return response
  },

  // Reset user password
  async resetPassword(userId) {
    const response = await api.post(`/admin/users/${userId}/reset-password`)
    return response
  },

  // Delete user
  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`)
    return response
  },

  // Get dashboard stats
  async getStats() {
    const response = await api.get('/admin/dashboard')
    return response
  }
}