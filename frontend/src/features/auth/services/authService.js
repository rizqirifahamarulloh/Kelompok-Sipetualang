import api from '@/services/api'

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (data) =>
    api.post('/auth/register', data),

  logout: () =>
    api.post('/auth/logout'),

  getProfile: () =>
    api.get('/auth/me'),

  refreshToken: () =>
    api.post('/auth/refresh'),
}
