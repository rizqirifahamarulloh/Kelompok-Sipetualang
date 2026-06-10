// src/profile/pages/delete-akun.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/profile/services/profileService';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { Trash2, AlertTriangle } from 'lucide-react';
import Navbar from '@/features/customer/components/Navbar';
import Sidebar from '@/features/customer/components/Sidebar';
import { getStorageUrl } from '@/utils/storageUrl';

export default function DeleteAkun() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [confirmText, setConfirmText] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const getInitials = () => user?.nama?.charAt(0).toUpperCase() || 'U';

    const handleDelete = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (confirmText !== 'HAPUS AKUN') {
                toast.error('Ketik "HAPUS AKUN" untuk konfirmasi');
                setLoading(false);
                return;
            }

            if (!password) {
                toast.error('Password wajib diisi');
                setLoading(false);
                return;
            }

            await profileService.deleteAccount({ password });

            toast.success('Akun berhasil dihapus');
            await logout();
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal hapus akun');
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
                            <CardHeader className="border-b bg-red-50 dark:bg-red-950/10 px-8 py-6">
                                <div className="flex items-center gap-2">
                                    <Trash2 size={18} className="text-red-600" />
                                    <CardTitle className="text-xl font-bold text-red-600">Hapus Akun</CardTitle>
                                </div>
                                <CardDescription className="text-red-600/70">
                                    Tindakan ini tidak dapat dibatalkan
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-8">
                                <form onSubmit={handleDelete} className="space-y-6">
                                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        <div className="text-sm text-red-700">
                                            <p className="font-semibold">Peringatan!</p>
                                            <p className="text-xs mt-1">Semua data Anda akan dihapus permanen dan tidak dapat dipulihkan.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-muted-foreground">
                                                Konfirmasi Hapus Akun
                                            </label>
                                            <Input
                                                value={confirmText}
                                                onChange={(e) => setConfirmText(e.target.value)}
                                                placeholder='Ketik "HAPUS AKUN" untuk konfirmasi'
                                                className="rounded-xl"
                                            />
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-muted-foreground">
                                                Konfirmasi Password
                                            </label>
                                            <Input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Masukkan password Anda"
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-3 pt-4 border-t">
                                        <Button type="submit" variant="destructive" disabled={loading} className="gap-2 rounded-xl">
                                            <Trash2 size={16} />
                                            {loading ? 'Menghapus...' : 'Hapus Akun Permanen'}
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