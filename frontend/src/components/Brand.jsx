import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import brandBg from '../assets/BG-Brand-Section.png';
import brand1 from '../assets/Logo-Brand-1.png';
import brand2 from '../assets/Logo-Brand-2.png';
import brand3 from '../assets/Logo-Brand-3.png';
import brand4 from '../assets/Logo-Brand-4.png';
import brand5 from '../assets/Logo-Brand-5.png';
import './Brand.css';

const brands = [brand1, brand2, brand3, brand4, brand5];

function Brand() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  // Duplicate brands for infinite marquee effect
  const marqueeItems = [...brands, ...brands, ...brands, ...brands];

  return (
    <section id="brand" className="brand" ref={ref}>
      <div className="brand__bg">
        <img src={brandBg} alt="" />
      </div>

      <motion.div
        className="brand__container"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <div className="brand__marquee">
          <div className="brand__marquee-track">
            {marqueeItems.map((brand, index) => (
              <div key={index} className="brand__logo-item">
                <img src={brand} alt={`Brand partner ${(index % brands.length) + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default Brand;
