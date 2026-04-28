import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import infoImage from '../../assets/beranda/Images-informasi-section.png';
import arrowRight from '../../assets/beranda/icon-arrow-right.svg';
import './Information.css';

function Information() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="information" className="information" ref={ref}>
      <div className="information__container">
        <motion.div
          className="information__image"
          initial={{ opacity: 0, x: -60 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <img src={infoImage} alt="SiPetualang gear rental information" />
        </motion.div>

        <motion.div
          className="information__content"
          initial={{ opacity: 0, x: 60 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          <span className="information__badge">SEWA GEAR TERBAIK</span>
          <h2 className="information__title">
            Sewa Gear Outdoor{'\n'}Kini Lebih Mudah!
          </h2>
          <p className="information__desc">
            SiPetualang hadir sebagai platform penyewaan peralatan outdoor
            terpercaya yang memudahkan kamu menikmati petualangan alam tanpa
            perlu membeli peralatan mahal. Dari tenda, sleeping bag, hingga
            peralatan hiking lengkap.
          </p>

          <div className="information__actions">
            <motion.a
              href="#category"
              className="information__cta"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Selengkapnya
              <img src={arrowRight} alt="" />
            </motion.a>

            <motion.button
              className="information__safety-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Info Keamanan
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Information;
