import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import AuthCallback from '@/features/auth/pages/AuthCallback'

// Pages
import Home from '@/features/landing/pages/Home'
import Login from '@/features/auth/pages/Login'
import Register from '@/features/auth/pages/Register'
import AdminLayout from '@/features/admin/components/AdminLayout'
import Dashboard from '@/features/admin/pages/Dashboard'
import Users from '@/features/admin/pages/Users'

// Profile - perbaiki pathnya
import Profile from '@/profile/pages/Profile'  // ← path yang benar
import EditProfile from '@/profile/pages/edit-profile'
import UpdatePassword from '@/profile/pages/update-password'
import DeleteAkun from '@/profile/pages/delete-akun'

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
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Profile routes — any authenticated user */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/edit" element={<EditProfile />} />
                  <Route path="/profile/update-password" element={<UpdatePassword />} />
                  <Route path="/profile/delete-akun" element={<DeleteAkun />} />
                </Route>

                {/* Admin routes — admin only */}
                <Route element={<ProtectedRoute roles={['admin']} />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/admin/users" element={<Users />} />
                    <Route path="/admin/gears" element={<div>Gears Page</div>} />
                    <Route path="/admin/categories" element={<div>Categories Page</div>} />
                    <Route path="/admin/destinations" element={<div>Destinations Page</div>} />
                    <Route path="/admin/transactions" element={<div>Transactions Page</div>} />
                    <Route path="/admin/payments" element={<div>Payments Page</div>} />
                    <Route path="/admin/ktp-verification" element={<div>KTP Verification Page</div>} />
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