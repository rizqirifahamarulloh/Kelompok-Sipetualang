// src/profile/pages/delete-akun.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function DeleteAkun() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [confirm, setConfirm] = useState('');

    const handleDelete = () => {
        if (confirm !== 'HAPUS AKUN') {
            toast.error('Ketik "HAPUS AKUN" untuk konfirmasi');
            return;
        }
        toast.success('Akun berhasil dihapus');
        logout();
        navigate('/');
    };

    return (
        <div className="container max-w-2xl py-8">
            <h1 className="text-2xl font-bold text-red-600">Hapus Akun</h1>
            <p className="text-muted-foreground mb-6">Tindakan ini tidak dapat dibatalkan</p>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-red-600">
                        ⚠️ Menghapus akun akan menghilangkan semua data Anda secara permanen
                    </p>
                </div>
                <div>
                    <label className="block mb-1">
                        Ketik <span className="font-bold">HAPUS AKUN</span> untuk konfirmasi
                    </label>
                    <input
                        type="text"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        placeholder="HAPUS AKUN"
                    />
                </div>
                <div className="flex gap-3">
                    <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">
                        Hapus Permanen
                    </button>
                    <Link to="/profile">
                        <button className="bg-gray-500 text-white px-4 py-2 rounded">
                            Batal
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}