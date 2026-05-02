// frontend/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/features/auth/services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const isAuthenticated = !!token && !!user
  
  // Ambil role langsung dari peran_pengguna
  const role = user?.peran_pengguna ?? null
  
  const hasRole = useCallback(
    (requiredRole) => role === requiredRole,
    [role]
  )

  // Cek auth saat pertama kali load
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const res = await authService.getProfile()
        const userData = res.data.user || res.data.data
        setUser(userData)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [token])

  const login = async (email, password) => {
    const res = await authService.login(email, password)
    
    const newToken = res.data.token || res.token
    const userData = res.data.user || res.data.data?.user
    
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)

    // Redirect berdasarkan role
    if (userData.peran_pengguna === 'admin') {
      navigate('/admin/dashboard')
    } else if (userData.peran_pengguna === 'pemilik') {
      navigate('/pemilik/dashboard')
    } else {
      navigate('/')
    }

    return res.data
  }

  const register = async (data) => {
    const res = await authService.register(data)
    return res.data
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // Abaikan error
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
      navigate('/login')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        role,
        hasRole,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Pindahkan hook ke file terpisah atau biarkan dengan comment refresh
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}