import { useAuth } from '@/contexts/AuthContext';
import Navbar from "@/features/customer/components/Navbar";
import Sidebar from "@/features/customer/components/Sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Edit, Key, Trash2, User } from 'lucide-react';
import { BASE_URL } from '@/services/api';
import { getStorageUrl } from '@/utils/storageUrl';

export default function ProfileDetail() {
  const { user } = useAuth();

  if (!user) return null;

  const getPhotoUrl = () => getStorageUrl(user?.profile_photo);

  const getInitials = () => user?.nama?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* 1. Navbar khusus Customer */}
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* 2. Sidebar khusus Customer */}
          <Sidebar
            user={user}
            getPhotoUrl={getPhotoUrl}
            getInitials={getInitials}
          />

          {/* 3. Konten Utama (Kotak-Kotak Data) */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="border-b bg-white/50 px-8 py-6">
                <div className="flex items-center gap-2">
                  <User className="size-5 text-emerald-600" />
                  <CardTitle className="text-xl font-bold">Data Profil</CardTitle>
                </div>
                <CardDescription>
                  Informasi akun Kamu ditampilkan di sini dan dapat diedit melalui tombol di bawah.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8 space-y-10">
                {/* Bagian Foto & Nama Tengah */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    {getPhotoUrl() ? (
                      <img src={getPhotoUrl()} alt="p" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md" />
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-emerald-100 flex items-center justify-center text-3xl font-bold text-emerald-700">
                        {getInitials()}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-xl text-slate-800">{user.nama}</h3>
                    <p className="text-sm text-slate-500 font-medium">{user.email}</p>
                  </div>
                </div>

                {/* Grid Data (Kotak-kotak) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 border-t pt-8">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Nama Lengkap</p>
                    <p className="font-semibold text-slate-700">{user.nama}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Alamat Email</p>
                    <p className="font-semibold text-slate-700">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Nomor Telepon</p>
                    <p className="font-semibold text-slate-700">{user.no_telp || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Peran Pengguna</p>
                    <p className="font-semibold text-slate-700 capitalize">{user.peran_pengguna || 'Customer'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Alamat</p>
                    <p className="font-semibold text-slate-700">{user.alamat || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Kota</p>
                    <p className="font-semibold text-slate-700">{user.kota || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tombol Aksi di bawah Kotak */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link to="/profile/edit"><Button variant="outline" className="w-full gap-2 border-slate-200">Edit Profil</Button></Link>
              <Link to="/profile/update-password"><Button variant="outline" className="w-full gap-2 border-slate-200">Ubah Password</Button></Link>
              <Link to="/profile/delete-akun"><Button variant="destructive" className="w-full gap-2 opacity-90">Hapus Akun</Button></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}