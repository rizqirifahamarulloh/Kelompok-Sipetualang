import { motion } from 'framer-motion'
import heroBg from '../assets/Image-bg.png'
import heroBgMobile from '../assets/Image-bg-android.png'
import arrowRight from '../assets/icon-arrow-right.svg'
import ScrollReveal from './ScrollReveal'
import './Hero.css'

function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero__bg">
        <img src={heroBg} alt="Mountain adventure background" className="hero__bg-desktop" />
        <img src={heroBgMobile} alt="Mountain adventure background" className="hero__bg-mobile" />
        <div className="hero__overlay"></div>
      </div>

      <div className="hero__content">
        <ScrollReveal>
          <h1 className="hero__title">
            Awali Petualangan{'\n'}Bersama{'\n'}SiPetualang
          </h1>
        </ScrollReveal>

        <ScrollReveal>
          <p className="hero__subtitle">
            Sewa perlengkapan gunung dan kemah dengan aman. Kami mencocokkan alat dengan lokasi tujuan kamu. Cek ketersediaan stok secara langsung dan pesan tanpa repot.
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="hero__buttons">
            <motion.a
              href="#category"
              className="hero__cta"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Mulai Sewa
              <img src={arrowRight} alt="" className="hero__cta-arrow" />
            </motion.a>

            <motion.a
              href="#how-it-works"
              className="hero__works-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cara Kerja
            </motion.a>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal>
        <div className="hero__scroll-indicator">
          <div className="hero__scroll-line"></div>
        </div>
      </ScrollReveal>

      <div className="hero__notch">
        <span className="hero__breadcrumb">
          <span className="hero__breadcrumb-home">Home</span>
          <span className="hero__breadcrumb-sep">{" > "}</span>
          <span className="hero__breadcrumb-page">Pages</span>
        </span>
      </div>
    </section>
  )
}

export default Hero