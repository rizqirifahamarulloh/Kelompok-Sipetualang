import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { toast } from 'sonner'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import { User, LogOut } from 'lucide-react'
import logo from '@/assets/beranda/Logo.png'
import searchIcon from '@/assets/beranda/icon-search.svg'
import cartIcon from '@/assets/beranda/icon-simple-cart.svg'
import arrowRight from '@/assets/beranda/icon-arrow-right.svg'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { t } = useLanguage()
  const { user, isAuthenticated, isLoading, logout,} = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Nav links
  const navLinks = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.catalog'), href: '/sewa-alat' },
    { label: t('nav.howItWorks'), href: '/cara-sewa' },
    { label: t('nav.about'), href: '/buka-rental' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownOpen && !e.target.closest('.user-menu')) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [dropdownOpen])

  const handleLogout = async () => {
    setDropdownOpen(false)
    setMobileOpen(false)
    await logout()
    toast.success(t('toast.logoutSuccess'))
    navigate('/')
  }

  const handleCartClick = () => {
    if (isAuthenticated) {
      navigate('/customer/cart')
    } else {
      navigate('/login')
    }
  }

  // Ambil inisial nama (MAX 2 huruf)
  const getUserInitials = () => {
    if (!user?.nama) return '?'
    const names = user.nama.split(' ')
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  // Check if a nav link is active
  const isActiveLink = (href) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname === href
  }

  return (
    <motion.nav
      className={`fixed top-0 inset-x-0 z-[1000] transition-all duration-300 ease-in-out
        ${scrolled
          ? 'bg-black/85 backdrop-blur-[12px] py-3.5 px-[60px] shadow-[0_4px_30px_rgba(0,0,0,0.3)] max-md:py-3 max-md:px-5 max-md:w-full max-md:rounded-none'
          : 'py-5 px-[60px] max-md:px-5 max-md:py-4'
        }
        ${mobileOpen ? 'max-md:bg-[rgb(15,15,15)]' : ''}
      `}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className={`max-w-[1400px] mx-auto flex items-center justify-between ${scrolled ? 'pt-5 pb-5' : 'pt-8'}`}>
        <Link to="/" className="max-md:ml-3.5">
          <img src={logo} alt="SiPetualang Logo" className="h-10 w-auto" />
        </Link>

        <ul className="flex gap-10 items-center list-none p-0 m-0 max-md:hidden">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                to={link.href}
                className={`nav-link-underline text-sm font-medium tracking-[0.3px] relative transition-colors duration-300 ease-in-out no-underline
                  ${isActiveLink(link.href) ? 'text-emerald-300' : 'text-white hover:text-emerald-300'}
                `}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Icons - Search, Cart, Chat */}
        <div className="flex gap-2 items-center max-md:hidden">
          <LanguageToggle variant="navbar" />
          <ThemeToggle variant="navbar" />
          <button 
            className="bg-transparent p-2 flex items-center justify-center rounded border-none cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/10" 
            aria-label="Search"
          >
            <img src={searchIcon} alt="Search" className="w-5 h-5" />
          </button>
          
          <button 
            className="bg-transparent p-2 flex items-center justify-center rounded border-none cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/10" 
            aria-label="Cart"
            onClick={handleCartClick}
          >
            <img src={cartIcon} alt="Cart" className="w-5 h-5" />
          </button>

          {/* Tombol CHAT */}
          <Link
             to="/customer/chat" 
            className="bg-transparent p-2 flex items-center justify-center rounded border-none cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/10"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </Link>

          {/* Auth section */}
          {isLoading ? (
            <div className="h-8 w-24 rounded-full bg-white/10 animate-pulse" />
          ) : isAuthenticated ? (
            <div className="relative user-menu ml-2">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer transition-opacity duration-300 hover:opacity-80 p-0"
              >
                <div className="w-8 h-8 bg-sp-primary rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {getUserInitials()}
                </div>
                <span className="text-sm font-medium text-white max-w-[120px] truncate">{user?.nama}</span>
                <svg className={`w-3.5 h-3.5 text-white/60 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-[1100]"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.nama}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      {/* Chat di dropdown */}
                      <Link
                        to="/chat"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors no-underline"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <svg className="size-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat
                      </Link>

                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors no-underline"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="size-4 text-gray-400" />
                        {t('nav.viewProfile')}
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors bg-transparent border-none cursor-pointer"
                      >
                        <LogOut className="size-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 bg-sp-primary text-white py-2.5 px-6 rounded-full text-sm font-semibold no-underline transition-all duration-300 ease-in-out ml-2 hover:bg-[rgb(26,122,77)] hover:-translate-y-0.5 group"
            >
              {t('nav.login')}
              <img src={arrowRight} alt="" className="w-4 h-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`hidden max-md:flex flex-col gap-[5px] bg-transparent p-2 border-none cursor-pointer mr-5`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-white rounded-sm transition-all duration-300 ease-in-out ${mobileOpen ? 'rotate-45 translate-x-[5px] translate-y-[5px]' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white rounded-sm transition-all duration-300 ease-in-out ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white rounded-sm transition-all duration-300 ease-in-out ${mobileOpen ? '-rotate-45 translate-x-[5px] -translate-y-[5px]' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="overflow-hidden bg-black/95 backdrop-blur-[12px] rounded-b-2xl"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ul className="flex flex-col gap-3 py-5 px-[30px] list-none m-0">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={`text-sm font-medium tracking-[0.3px] no-underline
                      ${isActiveLink(link.href) ? 'text-emerald-300' : 'text-white hover:text-emerald-300'}
                    `}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4 px-[30px] pb-6">
              <LanguageToggle variant="navbar" />
              <ThemeToggle variant="navbar" />
              <button className="bg-transparent p-2 flex items-center justify-center rounded border-none cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/10" aria-label="Search">
                <img src={searchIcon} alt="Search" className="w-5 h-5" />
              </button>
              <button className="bg-transparent p-2 flex items-center justify-center rounded border-none cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/10" aria-label="Cart" onClick={handleCartClick}>
                <img src={cartIcon} alt="Cart" className="w-5 h-5" />
              </button>

              {/* Chat di Mobile */}
              <Link
                to="/chat"
                className="bg-transparent p-2 flex items-center justify-center rounded border-none cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </Link>

              {/* Mobile Auth Section */}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 w-full mt-2 p-3 bg-white/10 rounded-lg no-underline transition-colors hover:bg-white/15"
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="w-10 h-10 bg-sp-primary rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {getUserInitials()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-white text-sm font-semibold truncate">{user?.nama}</span>
                      <span className="text-gray-400 text-xs truncate">{user?.email}</span>
                    </div>
                  </Link>

                  <Link
                    to="/chat"
                    className="flex items-center gap-2 bg-white/10 text-white py-2.5 px-4 rounded-full text-sm font-semibold w-full hover:bg-white/20 no-underline"
                    onClick={() => setMobileOpen(false)}
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat
                  </Link>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 bg-white/10 text-white py-2.5 px-4 rounded-full text-sm font-semibold w-full hover:bg-white/20 no-underline"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="size-4" />
                    {t('nav.viewProfile')}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 px-6 rounded-full text-sm font-semibold w-full hover:bg-red-700"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 bg-sp-primary text-white py-2.5 px-6 rounded-full text-sm font-semibold w-full mt-2 hover:bg-[rgb(26,122,77)] hover:-translate-y-0.5 group no-underline"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('nav.login')}
                  <img src={arrowRight} alt="" className="w-4 h-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}