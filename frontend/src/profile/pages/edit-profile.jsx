// src/profile/pages/edit-profile.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function EditProfile() {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [name, setName] = useState(user?.nama || user?.name || '');
    const [phone, setPhone] = useState(user?.no_telp || user?.phone || '');
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(
        user?.profile_photo ? `http://localhost:8000/storage/${user.profile_photo}` : null
    );

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Simulasi update ke localStorage
        const updatedUser = { 
            ...user, 
            name: name, 
            phone: phone,
            profile_photo: photo ? 'new-photo.jpg' : user?.profile_photo
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        toast.success('Profil berhasil diupdate');
        navigate('/profile');
    };

    // Ambil inisial untuk fallback avatar
    const getInitials = () => {
        const initialName = name || user?.nama || user?.name || 'User';
        return initialName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="container max-w-2xl py-8">
            <h1 className="text-2xl font-bold">Edit Profil</h1>
            <p className="text-muted-foreground mb-6">Perbarui informasi Anda</p>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                {/* Upload Foto */}
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        {photoPreview ? (
                            <img 
                                src={photoPreview} 
                                alt="Preview" 
                                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                                {getInitials()}
                            </div>
                        )}
                        <label className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer">
                            📷
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />
                        </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Klik ikon kamera untuk upload foto</p>
                </div>

                <div>
                    <label className="block mb-1">Nama</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block mb-1">Email</label>
                    <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full border rounded px-3 py-2 bg-gray-100"
                    />
                </div>
                <div>
                    <label className="block mb-1">No Telepon</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
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