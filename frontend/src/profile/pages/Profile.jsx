// src/profile/pages/Profile.jsx
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Upload, 
  Camera, 
  ChevronRight,
  Edit,
  Key,
  Trash2
} from 'lucide-react';

export default function Profile() {
  // Dummy data — replace with actual user data from context/state
  const user = { nama: 'John Doe', email: 'john@example.com', no_telp: '+6281234567890' };
  const isKtpVerified = false;

  const getPhotoUrl = () => null;
  const getInitials = () => user?.nama?.charAt(0).toUpperCase() || 'U';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <div className="container max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold">Profil & Verifikasi</h1>
            <p className="text-muted-foreground mt-1">
              Amankan identitas Anda untuk mengakses perlengkapan ekspedisi premium.
            </p>
          </div>
        </div>

        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Kiri */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Sidebar 
                  user={user}
                  isKtpVerified={isKtpVerified}
                  getPhotoUrl={getPhotoUrl}
                  getInitials={getInitials}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="size-5 text-primary" />
                    <CardTitle>Verifikasi Identitas KTP</CardTitle>
                  </div>
                  <CardDescription>
                    KTP diperlukan untuk semua penyewaan perlengkapan bernilai tinggi.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Steps */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload size={20} className="text-primary" />
                      </div>
                      <p className="font-medium text-sm">Upload Foto KTP</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG maks. 5MB</p>
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        <Upload size={14} className="mr-2" />
                        Klik untuk upload
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Camera size={20} className="text-primary" />
                      </div>
                      <p className="font-medium text-sm">Selfie dengan KTP</p>
                      <p className="text-xs text-muted-foreground mt-1">Foto sambil memegang KTP</p>
                      <Button variant="outline" size="sm" className="mt-3 w-full">
                        <Camera size={14} className="mr-2" />
                        Ambil foto
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Guidelines */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p className="font-semibold">📄 Panduan Foto KTP</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Pastikan semua detail terlihat jelas</li>
                        <li>Hindari silau dan tepi buram</li>
                        <li>Pencahayaan yang baik</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">🤳 Panduan Selfie</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Pegang KTP di samping wajah</li>
                        <li>Jangan tutupi fitur wajah</li>
                        <li>Hadap kamera dengan jelas</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <Shield size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Verifikasi terenkripsi end-to-end</p>
                        <p className="text-xs text-muted-foreground">Data Anda aman bersama kami</p>
                      </div>
                    </div>
                    <Button className="gap-2">
                      Kirim untuk Ditinjau
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Link to="/profile/edit" className="flex-1">
                  <Button variant="outline" className="w-full gap-2">
                    <Edit size={16} />
                    Edit Profil
                  </Button>
                </Link>
                <Link to="/profile/update-password" className="flex-1">
                  <Button variant="outline" className="w-full gap-2">
                    <Key size={16} />
                    Ubah Password
                  </Button>
                </Link>
                <Link to="/profile/delete-akun" className="flex-1">
                  <Button variant="destructive" className="w-full gap-2">
                    <Trash2 size={16} />
                    Hapus Akun
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}