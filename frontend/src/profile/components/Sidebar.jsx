// src/profile/components/Sidebar.jsx
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  User,
  Package,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  Home
} from 'lucide-react';

export default function Sidebar({ user, isKtpVerified, getPhotoUrl, getInitials }) {
  return (
    <Card>
      <CardContent className="p-6">
        {/* Avatar & Nama */}
        <div className="text-center">
          <div className="relative inline-block">
            <Avatar className="size-20 mx-auto ring-4 ring-primary/20">
              <AvatarImage src={getPhotoUrl()} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
          <h2 className="text-lg font-semibold mt-3">{user?.nama || user?.name}</h2>
          <Badge className="mt-1 bg-green-500 text-xs">
            <CheckCircle size={10} className="mr-1" />
            {isKtpVerified ? 'Terverifikasi' : 'Belum Terverifikasi'}
          </Badge>
        </div>

        <Separator className="my-4" />

        {/* Menu Sidebar */}
        <div className="space-y-1">
          <Link 
            to="/profile" 
            className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg bg-primary/10 text-primary font-medium"
          >
            <User size={16} />
            Profil Saya
          </Link>
          <Link 
            to="/profile/rentals" 
            className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg hover:bg-muted transition"
          >
            <Package size={16} />
            Penyewaan Saya
          </Link>
          <Link 
            to="/profile/transactions" 
            className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg hover:bg-muted transition"
          >
            <CreditCard size={16} />
            Transaksi
          </Link>
          <Link 
            to="/profile/verification" 
            className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg hover:bg-muted transition"
          >
            <Shield size={16} />
            Verifikasi
          </Link>
        </div>

        <Separator className="my-4" />

        {/* Informasi Ringkas */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{user?.no_telp || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Indonesia</span>
          </div>
        </div>

        <Separator className="my-4" />

        <Link to="/">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Home size={14} />
            Kembali ke Beranda
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}