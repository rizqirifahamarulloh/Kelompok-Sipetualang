// frontend/src/features/auth/services/authService.js
import api from '@/services/api'


export const authService = {
  async login(email, password) {
    const response = await api.post('/login', { email, password })
    return response
  },

  async register(data) {
    const response = await api.post('/register', data)
    return response
  },

  async logout() {
    const response = await api.post('/logout')
    return response
  },

  async getProfile() {
    const response = await api.get('/me')
    return response
  },

  async updateProfile(data) {
    const response = await api.put('/profile', data)
    return response
  },

  async uploadKTP(formData) {
    const response = await api.post('/upload-ktp', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  },
}