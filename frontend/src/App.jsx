import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

// Pages
import Home from '@/features/landing/pages/Home'
import Login from '@/features/auth/pages/Login'
import Register from '@/features/auth/pages/Register'
import AdminLayout from '@/features/admin/components/AdminLayout'
import Dashboard from '@/features/admin/pages/Dashboard'

function App() {
  return (
    <BrowserRouter>
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
            <Route
              path="/unauthorized"
              element={
                <div className="flex h-screen items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold">403</h1>
                    <p className="mt-2 text-muted-foreground">
                      Anda tidak memiliki akses ke halaman ini
                    </p>
                  </div>
                </div>
              }
            />
          </Routes>
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App