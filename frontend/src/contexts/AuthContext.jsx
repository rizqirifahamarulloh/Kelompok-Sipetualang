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
  const roles = user?.roles?.map((r) => r.name) ?? []

  const hasRole = useCallback(
    (role) => roles.includes(role),
    [roles]
  )

  // Check auth on mount — validate existing token
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const res = await authService.getProfile()
        setUser(res.data.data)
      } catch {
        // Token invalid → clear
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
    const { token: newToken, user: userData } = res.data.data

    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)

    // Route based on role
    const userRoles = userData.roles?.map((r) => r.name) ?? []
    if (userRoles.includes('super_admin')) {
      navigate('/admin/dashboard')
    } else if (userRoles.includes('penyewa')) {
      navigate('/penyewa/dashboard')
    } else {
      navigate('/customer/dashboard')
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
      // Ignore errors — token might already be invalid
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
        roles,
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
