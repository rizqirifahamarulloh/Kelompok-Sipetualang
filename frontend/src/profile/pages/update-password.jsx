// halaman ubah password
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/profile/services/profileService';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { Key } from 'lucide-react';
import Navbar from '@/features/customer/components/Navbar';
import Sidebar from '@/features/customer/components/Sidebar';
import { getStorageUrl } from '@/utils/storageUrl';

export default function UpdatePassword() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const getInitials = () => user?.nama?.charAt(0).toUpperCase() || 'U';

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Konfirmasi password tidak cocok');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password minimal 6 karakter');
            return;
        }

        setLoading(true);

        try {
            await profileService.updatePassword({
                current_password: oldPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });

            toast.success('Password berhasil diubah');
            navigate('/profile');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal mengubah password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    
                    <Sidebar
                        user={user}
                        getPhotoUrl={() => getStorageUrl(user?.profile_photo)}
                        getInitials={getInitials}
                    />

                    <div className="lg:col-span-3">
                        <Card className="border shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="border-b bg-muted/30 px-8 py-6">
                                <div className="flex items-center gap-2">
                                    <Key size={18} className="text-primary" />
                                    <CardTitle className="text-xl font-bold">Ubah Password</CardTitle>
                                </div>
                                <CardDescription>
                                    Pastikan password baru mudah diingat tapi aman
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-muted-foreground">Password Lama</label>
                                            <Input
                                                type="password"
                                                placeholder="Masukkan password lama"
                                                value={oldPassword}
                                                onChange={(e) => setOldPassword(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-muted-foreground">Password Baru</label>
                                            <Input
                                                type="password"
                                                placeholder="Minimal 6 karakter"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-muted-foreground">Konfirmasi Password Baru</label>
                                            <Input
                                                type="password"
                                                placeholder="Ketik ulang password baru"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-3 pt-4 border-t">
                                        <Button type="submit" disabled={loading} className="rounded-xl">
                                            {loading ? 'Menyimpan...' : 'Simpan Password'}
                                        </Button>
                                        <Link to="/profile">
                                            <Button variant="outline" className="rounded-xl">Batal</Button>
                                        </Link>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}