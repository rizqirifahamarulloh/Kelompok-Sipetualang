import { motion } from 'framer-motion';
import searchIcon from '../assets/Icon-Search-Services.svg';
import tagIcon from '../assets/Icon-Tag-Service.svg';
import documentIcon from '../assets/Icon-Document-Service.svg';
import sendIcon from '../assets/Icon-Send-Service.svg';
import ScrollReveal from './ScrollReveal';
import './HowItWorks.css';

const steps = [
  {
    icon: searchIcon,
    title: 'Pencarian',
    desc: 'Cari alat favorit Anda dari berbagai kategori dan merek terpercaya.',
  },
  {
    icon: tagIcon,
    title: 'Pemesanan',
    desc: 'Cari alat favorit Anda dari berbagai kategori dan merek terpercaya.',
  },
  {
    icon: documentIcon,
    title: 'Pengambilan',
    desc: 'Cari alat favorit Anda dari berbagai kategori dan merek terpercaya.',
  },
  {
    icon: sendIcon,
    title: 'Pengembalian',
    desc: 'Cari alat favorit Anda dari berbagai kategori dan merek terpercaya.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works">
      <div className="how-it-works__container">
        <ScrollReveal>
          <div className="how-it-works__header">
            <div className="how-it-works__title-wrapper">
              <span className="how-it-works__badge">LANGKAH MUDAH</span>
              <h2 className="how-it-works__title">
                Cara Kerja Utama{'\n'}SiPetualang
              </h2>
            </div>
            <div className="how-it-works__desc-wrapper">
              <p className="how-it-works__description">
                Kami merancang sistem peminjaman yang ringkas dan melindungi kedua belah pihak. Ikuti empat langkah ini untuk memulai perjalanan kamu.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <div className="how-it-works__grid">
          {steps.map((step, index) => (
            <ScrollReveal key={index}>
              <motion.div
                className="how-it-works__card"
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <img src={step.icon} alt={step.title} className="how-it-works__icon" />
                <h3 className="how-it-works__card-title">{step.title}</h3>
                <p className="how-it-works__card-desc">{step.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;