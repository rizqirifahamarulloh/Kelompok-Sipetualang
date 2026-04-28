import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../assets/beranda/Logo.png'
import searchIcon from '../../assets/beranda/icon-search.svg'
import cartIcon from '../../assets/beranda/icon-simple-cart.svg'
import arrowRight from '../../assets/beranda/icon-arrow-right.svg'
import './Navbar.css'

const navLinks = [
  { label: 'Beranda', href: '#hero' },
  { label: 'Sewa Alat', href: '#category' },
  { label: 'Destinasi', href: '#destinasi' },
  { label: 'Info Keamanan', href: '#information' },
  { label: 'Kontak', href: '#footer' },
  { label: 'Buka Rental', href: '#buka-rental' }
]

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${mobileOpen ? 'active' : ''}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="navbar__container">
        <a href="#hero" className="navbar__logo">
          <img src={logo} alt="SiPetualang Logo" />
        </a>

        <ul className="navbar__links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="navbar__link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar__actions">
          <button className="navbar__icon-btn" aria-label="Search">
            <img src={searchIcon} alt="Search" />
          </button>
          <button className="navbar__icon-btn" aria-label="Cart">
            <img src={cartIcon} alt="Cart" />
          </button>
          <a href="#login" className="navbar__login-btn">
            Masuk
            <img src={arrowRight} alt="" className="navbar__login-icon" />
          </a>
        </div>

        <button
          className={`navbar__hamburger ${mobileOpen ? 'active' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar__mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ul className="navbar__mobile-links">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="navbar__link"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="navbar__mobile-actions">
              <button className="navbar__icon-btn" aria-label="Search">
                <img src={searchIcon} alt="Search" />
              </button>
              <button className="navbar__icon-btn" aria-label="Cart">
                <img src={cartIcon} alt="Cart" />
              </button>
              <a href="#login" className="navbar__login-btn">
                Masuk
                <img src={arrowRight} alt="" className="navbar__login-icon" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar