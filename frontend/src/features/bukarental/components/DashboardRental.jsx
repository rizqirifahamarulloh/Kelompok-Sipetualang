import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/features/customer/components/Navbar'
import Sidebar from '@/features/customer/components/Sidebar'

export default function DashboardRental() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && user.rental !== 'true') {
      navigate('/buka-rental', { replace: true })
    }
  }, [user, navigate])

  const getPhotoUrl = () => {
    if (!user?.profile_photo) return null
    if (user.profile_photo.startsWith('http')) return user.profile_photo
    return `http://localhost:8000/storage/${user.profile_photo}`
  }

  const getInitials = () => user?.nama?.charAt(0).toUpperCase() || 'U'

  if (user?.rental !== 'true') return null;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-background pt-20">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* SIDEBAR */}
            <Sidebar
              user={user}
              getPhotoUrl={getPhotoUrl}
              getInitials={getInitials}
            />

            {/* MAIN CONTENT */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-card border rounded-xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8 border-b pb-6">
                  <div>
                    <h1 className="text-2xl font-bold mb-1">Kelola Rental Kamu</h1>
                    <p className="text-sm text-muted-foreground">Dashboard Manajemen Barang Sewa</p>
                  </div>
                  <button className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition shadow-sm border-none">
                     + Tambah Barang
                  </button>
                </div>
                
                <div className="border rounded-2xl p-12 text-center bg-gray-50/50 dark:bg-gray-900/50 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center min-h-[300px]">
                   <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                     <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                   </div>
                   <h3 className="font-semibold text-lg mb-2">Belum ada barang yang ditambahkan</h3>
                   <p className="text-sm text-gray-500 max-w-md">Kamu belum memiliki inventaris penyewaan. Tambahkan peralatan pertama Kamu untuk mulai menerima pesanan.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
