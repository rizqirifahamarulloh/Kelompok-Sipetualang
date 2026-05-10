import { useState } from "react";
import axios from "axios";
import { useAuth } from '@/contexts/AuthContext';
import { customerService } from '../services/customerService';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Shield, Upload, Camera, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function Verifikasi() {
  const { user } = useAuth();

  const [ktp, setKtp] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-base text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  const getPhotoUrl = () => {
    if (!user?.profile_photo) return null;
    if (user.profile_photo.startsWith('http')) return user.profile_photo;
    return `http://localhost:8000/storage/${user.profile_photo}`;
  };

  const getInitials = () => user?.nama?.charAt(0).toUpperCase() || 'U';

  const handleSubmit = async () => {
    if (!ktp || !selfie) {
      toast.warning("Upload KTP & selfie terlebih dahulu!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("foto_ktp", ktp);
    formData.append("foto_selfie_ktp", selfie);

    try {
      await customerService.submitVerification(formData);
      toast.success("Dokumen verifikasi berhasil dikirim!");
      setKtp(null);
      setSelfie(null);
    } catch (err) {
      console.error('Upload verifikasi error:', err);
      const message = err?.response?.data?.message || err?.message || 'Gagal upload dokumen';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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

            {/* MAIN */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="size-5 text-primary" />
                    <CardTitle>Verifikasi Identitas KTP</CardTitle>
                  </div>
                  <CardDescription>
                    KTP diperlukan untuk prosedur keamanan penyewaan alat
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">

                  {/* UPLOAD AREA */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* KTP */}
                    <div className="p-6 border-2 border-dashed rounded-xl text-center hover:bg-accent/50 transition-colors">
                      <Upload className="mx-auto mb-3 text-primary size-8" />
                      <p className="text-sm font-semibold">Foto KTP Asli</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setKtp(e.target.files[0])}
                        className="mt-3 text-xs w-full"
                      />
                      {ktp && <p className="text-xs mt-2 text-green-600 font-medium">✓ {ktp.name}</p>}
                    </div>

                    {/* SELFIE */}
                    <div className="p-6 border-2 border-dashed rounded-xl text-center hover:bg-accent/50 transition-colors">
                      <Camera className="mx-auto mb-3 text-primary size-8" />
                      <p className="text-sm font-semibold">Selfie + KTP</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelfie(e.target.files[0])}
                        className="mt-3 text-xs w-full"
                      />
                      {selfie && <p className="text-xs mt-2 text-green-600 font-medium">✓ {selfie.name}</p>}
                    </div>
                  </div>

                  <Separator />

                  {/* GUIDELINES SECTION */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <p className="text-sm font-bold flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-green-500" /> Panduan Foto KTP
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>KTP harus asli, bukan fotokopi</li>
                        <li>Tulisan dan angka terbaca jelas</li>
                        <li>Tidak tertutup bayangan atau pantulan cahaya</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-green-500" /> Panduan Selfie
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Wajah terlihat jelas tanpa masker/kacamata hitam</li>
                        <li>Pegang KTP di bawah dagu, jangan tutupi wajah</li>
                        <li>Pastikan kamera fokus pada wajah dan KTP</li>
                      </ul>
                    </div>
                  </div>

                  {/* SECURITY INFO */}
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                      <Shield size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Data Anda Terenkripsi</p>
                      <p className="text-xs text-muted-foreground">Kami menjamin kerahasiaan dokumen Anda hanya untuk verifikasi internal.</p>
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full h-11"
                  >
                    {loading ? "Sedang Mengirim..." : "Kirim Dokumen Verifikasi"}
                    <ChevronRight className="ml-2 size-4" />
                  </Button>

                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}