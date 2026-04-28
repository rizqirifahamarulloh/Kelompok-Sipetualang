import ScrollReveal from './ScrollReveal'
import footerBg from '../../assets/beranda/BG-Footer-Section.png'
import logo from '../../assets/beranda/Logo.png'
import facebookIcon from '../../assets/beranda/Facebook Icon.svg'
import linkedinIcon from '../../assets/beranda/LinkedIn.svg'
import './Footer.css'

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer id="footer" className="footer">
      <div className="footer__bg">
        <img src={footerBg} alt="" />
      </div>

      <div className="footer__container">
        <ScrollReveal>
          <div className="footer__grid">
            <div className="footer__brand">
              <img src={logo} alt="SiPetualang" className="footer__logo" />
              <p className="footer__brand-desc">
                Platform penyewaan peralatan outdoor terpercaya Nikmati petualangan tanpa batas bersama SiPetualang
              </p>
              <div className="footer__socials">
                <a href="#" className="footer__social-link" aria-label="Facebook">
                  <img src={facebookIcon} alt="Facebook" />
                </a>
                <a href="#" className="footer__social-link" aria-label="LinkedIn">
                  <img src={linkedinIcon} alt="LinkedIn" />
                </a>
              </div>
            </div>

            <div className="footer__column">
              <h4 className="footer__column-title">Tentang SiPetualang</h4>
              <ul className="footer__links">
                <li><a href="#tentang-kami">→ Tentang Kami</a></li>
                <li><a href="#cara-sewa">Cara sewa</a></li>
                <li><a href="#cara-member">Cara jadi member</a></li>
                <li><a href="#cara-pengembalian">Cara pengembalian</a></li>
                <li><a href="#syarat-ketentuan">Syarat dan Ketentuan</a></li>
              </ul>
            </div>

            <div className="footer__column">
              <h4 className="footer__column-title">Informasi</h4>
              <ul className="footer__links">
                <li><a href="#informasi-keamanan">→ Informasi Keamanan</a></li>
              </ul>
            </div>

            <div className="footer__column">
              <h4 className="footer__column-title">Layanan Bantuan</h4>
              <ul className="footer__links">
                <li>2307 Indonesia, Jawa Barat, Depok.</li>
                <li><a href="mailto:Spetualang@7oroof.com" style={{ color: 'rgb(42, 181, 115)' }}>Spetualang@7oroof.com</a></li>
                <li style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>+62 011 6114 5741</li>
              </ul>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="footer__bottom">
            <p className="footer__copyright">
              ©2026 SiPetualang, All Rights Reserved. With Love by <a href="#" style={{ color: 'rgb(42, 181, 115)', textDecoration: 'none' }}>Spetualang.com</a>
            </p>

            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.3)' }}>
              <a href="#terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms & Conditions</a>
              <a href="#privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#sitemap" style={{ color: 'inherit', textDecoration: 'none' }}>Sitemap</a>
            </div>

            <button
              className="footer__scroll-top"
              onClick={scrollToTop}
              aria-label="Scroll to top"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  )
}

export default Footer