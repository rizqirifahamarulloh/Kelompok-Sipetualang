// src/profile/pages/update-password.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function UpdatePassword() {
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Password baru tidak cocok');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password minimal 6 karakter');
            return;
        }
        toast.success('Password berhasil diubah (simulasi)');
        navigate('/profile');
    };

    return (
        <div className="container max-w-2xl py-8">
            <h1 className="text-2xl font-bold">Ganti Password</h1>
            <p className="text-muted-foreground mb-6">Perbarui password Anda</p>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                <div>
                    <label className="block mb-1">Password Lama</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block mb-1">Password Baru</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block mb-1">Konfirmasi Password Baru</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div className="flex gap-3">
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                        Simpan
                    </button>
                    <Link to="/profile">
                        <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded">
                            Batal
                        </button>
                    </Link>
                </div>
            </form>
        </div>
    );
}