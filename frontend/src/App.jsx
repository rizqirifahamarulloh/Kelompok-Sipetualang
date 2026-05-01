import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import ProtectedRoute from '@/components/ProtectedRoute'

// Pages
import Home from '@/features/landing/pages/Home'
import Login from '@/features/auth/pages/Login'
import Register from '@/features/auth/pages/Register'
import AdminLayout from '@/features/admin/components/AdminLayout'
import Dashboard from '@/features/admin/pages/Dashboard'

function Unauthorized() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold">403</h1>
        <p className="mt-2 text-muted-foreground">
          Unauthorized access
        </p>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Admin routes — super_admin only */}
                <Route element={<ProtectedRoute roles={['super_admin']} />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                  </Route>
                </Route>

                {/* Unauthorized fallback */}
                <Route path="/unauthorized" element={<Unauthorized />} />
              </Routes>
              <Toaster richColors position="top-right" />
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App