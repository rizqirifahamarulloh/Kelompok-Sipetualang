// konfigurasi api utama
import axios from 'axios'

// ganti true/false buat pindah antara API production sama lokal
export const USE_PRODUCTION_API = true;

export const BASE_URL = USE_PRODUCTION_API ? 'https://api.fakerryugan.my.id' : 'http://localhost:8000';
export const API_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// pasang token otomatis di setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// tangani error dari response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // kalau kena 401 (gak authorized), coba refresh token dulu
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const token = localStorage.getItem('token')
        if (token) {
          const response = await axios.post(
            `${API_URL}/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )

          const { token: newToken } = response.data
          localStorage.setItem('token', newToken)

          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // refresh gagal, paksa logout
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api