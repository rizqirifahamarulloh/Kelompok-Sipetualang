import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import { navLinks } from '@/features/landing/constants'
import logo from '@/assets/beranda/Logo.png'
import searchIcon from '@/assets/beranda/icon-search.svg'
import cartIcon from '@/assets/beranda/icon-simple-cart.svg'
import arrowRight from '@/assets/beranda/icon-arrow-right.svg'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { t } = useLanguage()
  const { user, isAuthenticated, logout, role } = useAuth()
  const navigate = useNavigate()

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
    await logout()
    setDropdownOpen(false)
    navigate('/')
  }

  const handleCartClick = () => {
    if (isAuthenticated) {
      navigate('/cart')
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
        <a href="#hero" className="max-md:ml-3.5">
          <img src={logo} alt="SiPetualang Logo" className="h-10 w-auto" />
        </a>

        <ul className="flex gap-10 items-center list-none p-0 m-0 max-md:hidden">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="nav-link-underline text-white text-sm font-medium tracking-[0.3px] relative transition-colors duration-300 ease-in-out no-underline hover:text-emerald-300"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex gap-2 items-center max-md:hidden">
          <LanguageToggle />
          <ThemeToggle />
          <button className="bg-transparent p-2 flex items-center justify-center rounded border-none cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/10" aria-label="Search">
            <img src={searchIcon} alt="Search" className="w-5 h-5" />
          </button>
          <button 
            className="bg-transparent p-2 flex items-center justify-center rounded border-none cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/10" 
            aria-label="Cart"
            onClick={handleCartClick}
          >
            <img src={cartIcon} alt="Cart" className="w-5 h-5" />
          </button>

          {/* Cek apakah user sudah login */}
          {isAuthenticated ? (
            <div className="relative user-menu ml-2">
              {/* Tombol profile dengan nama user */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-sp-primary text-white py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-[rgb(26,122,77)] hover:-translate-y-0.5"
              >
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                  {getUserInitials()}
                </div>
                <span className="max-w-[120px] truncate">{user?.nama}</span>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
                  >
                    <div className="py-1">
                      {/* Profile */}
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        👤 Profile
                      </Link>

                      {/* Menu khusus role */}
                      {role === 'penyewa' && (
                        <Link
                          to="/my-rentals"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          📋 Riwayat Sewa
                        </Link>
                      )}

                      {role === 'pemilik' && (
                        <Link
                          to="/pemilik/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          📊 Dashboard
                        </Link>
                      )}

                      {role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          ⚙️ Admin Panel
                        </Link>
                      )}

                      <hr className="my-1 border-gray-200 dark:border-gray-700" />

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        🚪 Logout
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
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white text-sm font-medium tracking-[0.3px] no-underline hover:text-emerald-300"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4 px-[30px] pb-6">
              <LanguageToggle />
              <ThemeToggle />
              <button className="bg-transparent p-2 flex items-center justify-center rounded border-none cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/10" aria-label="Search">
                <img src={searchIcon} alt="Search" className="w-5 h-5" />
              </button>
              <button className="bg-transparent p-2 flex items-center justify-center rounded border-none cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/10" aria-label="Cart" onClick={handleCartClick}>
                <img src={cartIcon} alt="Cart" className="w-5 h-5" />
              </button>

              {/* Mobile Auth Section */}
              {isAuthenticated ? (
                <>
                  {/* Info user */}
                  <div className="w-full mt-2 p-3 bg-white/10 rounded-lg">
                    <p className="text-white text-sm font-semibold">{user?.nama}</p>
                    <p className="text-gray-400 text-xs">{user?.email}</p>
                    <p className="text-emerald-400 text-xs mt-1 capitalize">{role}</p>
                  </div>

                  {/* Menu mobile */}
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 bg-white/10 text-white py-2.5 px-4 rounded-full text-sm font-semibold w-full hover:bg-white/20"
                    onClick={() => setMobileOpen(false)}
                  >
                    👤 Profile
                  </Link>

                  {role === 'penyewa' && (
                    <Link
                      to="/my-rentals"
                      className="flex items-center gap-2 bg-white/10 text-white py-2.5 px-4 rounded-full text-sm font-semibold w-full hover:bg-white/20"
                      onClick={() => setMobileOpen(false)}
                    >
                      📋 Riwayat Sewa
                    </Link>
                  )}

                  {(role === 'pemilik' || role === 'admin') && (
                    <Link
                      to={role === 'admin' ? '/admin/dashboard' : '/pemilik/dashboard'}
                      className="flex items-center gap-2 bg-white/10 text-white py-2.5 px-4 rounded-full text-sm font-semibold w-full hover:bg-white/20"
                      onClick={() => setMobileOpen(false)}
                    >
                      {role === 'admin' ? '⚙️ Admin Panel' : '📊 Dashboard'}
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 px-6 rounded-full text-sm font-semibold w-full hover:bg-red-700"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 bg-sp-primary text-white py-2.5 px-6 rounded-full text-sm font-semibold w-full mt-2 hover:bg-[rgb(26,122,77)] hover:-translate-y-0.5 group"
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