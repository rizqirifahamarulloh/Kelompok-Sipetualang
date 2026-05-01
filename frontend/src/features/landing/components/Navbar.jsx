import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { navLinks } from '@/features/landing/constants'
import logo from '@/assets/beranda/Logo.png'
import searchIcon from '@/assets/beranda/icon-search.svg'
import cartIcon from '@/assets/beranda/icon-simple-cart.svg'
import arrowRight from '@/assets/beranda/icon-arrow-right.svg'

export default function Navbar() {
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

        <div className="flex gap-4 items-center max-md:hidden">
          <button className="bg-transparent p-2 flex items-center justify-center rounded border-none cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/10" aria-label="Search">
            <img src={searchIcon} alt="Search" className="w-5 h-5" />
          </button>
          <button className="bg-transparent p-2 flex items-center justify-center rounded border-none cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/10" aria-label="Cart">
            <img src={cartIcon} alt="Cart" className="w-5 h-5" />
          </button>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 bg-sp-primary text-white py-2.5 px-6 rounded-full text-sm font-semibold no-underline transition-all duration-300 ease-in-out ml-4 hover:bg-[rgb(26,122,77)] hover:-translate-y-0.5 group"
          >
            Masuk
            <img src={arrowRight} alt="" className="w-4 h-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
          </Link>
        </div>

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
                    className="nav-link-underline text-white text-sm font-medium tracking-[0.3px] relative transition-colors duration-300 ease-in-out no-underline hover:text-emerald-300"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4 px-[30px] pb-6">
              <button className="bg-transparent p-2 flex items-center justify-center rounded border-none cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/10" aria-label="Search">
                <img src={searchIcon} alt="Search" className="w-5 h-5" />
              </button>
              <button className="bg-transparent p-2 flex items-center justify-center rounded border-none cursor-pointer transition-colors duration-300 ease-in-out hover:bg-white/10" aria-label="Cart">
                <img src={cartIcon} alt="Cart" className="w-5 h-5" />
              </button>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 bg-sp-primary text-white py-2.5 px-6 rounded-full text-sm font-semibold no-underline transition-all duration-300 ease-in-out w-full mt-2 hover:bg-[rgb(26,122,77)] hover:-translate-y-0.5 group"
                onClick={() => setMobileOpen(false)}
              >
                Masuk
                <img src={arrowRight} alt="" className="w-4 h-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
