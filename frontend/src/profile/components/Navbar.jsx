// src/profile/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Mountain, ChevronLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageToggle from '@/components/LanguageToggle';
import { i } from 'framer-motion/client';
import { Button } from '@/components/ui/button';


export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
            <Link to="/" className="text-sm hover:text-primary transition">Home</Link>
            <Link to="/catalog" className="text-sm hover:text-primary transition">Catalog</Link>
            <Link to="/about" className="text-sm hover:text-primary transition">About</Link>
            <Link to="/contact" className="text-sm hover:text-primary transition">Contact</Link>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
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
              <Link to="/" className="text-sm py-2 hover:text-primary transition">Home</Link>
              <Link to="/catalog" className="text-sm py-2 hover:text-primary transition">Catalog</Link>
              <Link to="/about" className="text-sm py-2 hover:text-primary transition">About</Link>
              <Link to="/contact" className="text-sm py-2 hover:text-primary transition">Contact</Link>
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex gap-2">
                  <LanguageToggle />
                  <ThemeToggle />
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