// src/profile/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Mountain, ChevronLeft, MessageCircle } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();
  const [unreadChats, setUnreadChats] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnreadChats = async () => {
      try {
        const res = await api.get('/customer/chat/conversations');
        const convs = res.data.data || [];
        const totalUnread = convs.reduce((sum, item) => sum + (item.unread_count || 0), 0);
        setUnreadChats(totalUnread);
      } catch (err) {
        console.error('Gagal mengambil data chat:', err);
      }
    };

    fetchUnreadChats();
    const interval = setInterval(fetchUnreadChats, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm' : 'bg-background'
    }`}>
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Mountain className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">SiPetualang</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm hover:text-primary transition">Beranda</Link>
            <Link to="/sewa-alat" className="text-sm hover:text-primary transition">Sewa Alat</Link>
            <Link to="/buka-rental" className="text-sm hover:text-primary transition">Buka Rental</Link>
            <Link to="/cara-sewa" className="text-sm hover:text-primary transition">Cara Sewa</Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <NotificationBell />
            <Link to="/customer/chat" className="relative p-2 text-gray-600 hover:text-emerald-600 transition duration-200">
              <MessageCircle className="h-5 w-5" />
              {unreadChats > 0 && (
                <span className="absolute top-0 right-0 flex h-4 min-w-4 px-1 items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full animate-bounce pointer-events-none">
                  {unreadChats}
                </span>
              )}
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ChevronLeft size={16} />
                Kembali
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm py-2 hover:text-primary transition">Beranda</Link>
              <Link to="/sewa-alat" className="text-sm py-2 hover:text-primary transition">Sewa Alat</Link>
              <Link to="/buka-rental" className="text-sm py-2 hover:text-primary transition">Buka Rental</Link>
              <Link to="/cara-sewa" className="text-sm py-2 hover:text-primary transition">Cara Sewa</Link>
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex gap-4 items-center">
                  <NotificationBell />
                  <Link to="/customer/chat" className="relative p-2 text-gray-600 hover:text-emerald-600 transition">
                    <MessageCircle className="h-5 w-5" />
                    {unreadChats > 0 && (
                      <span className="absolute top-0 right-0 flex h-4 min-w-4 px-1 items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full animate-bounce pointer-events-none">
                        {unreadChats}
                      </span>
                    )}
                  </Link>
                </div>
                <Link to="/">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ChevronLeft size={16} />
                    Kembali
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}