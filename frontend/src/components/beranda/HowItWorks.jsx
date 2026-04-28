import { motion } from 'framer-motion';
import searchIcon from '../../assets/beranda/Icon-Search-Services.svg';
import tagIcon from '../../assets/beranda/Icon-Tag-Service.svg';
import documentIcon from '../../assets/beranda/Icon-Document-Service.svg';
import sendIcon from '../../assets/beranda/Icon-Send-Service.svg';
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
    desc: 'Tentukan tanggal mulai dan durasi sewa yang sesuai dengan jadwal Anda.',
  },
  {
    icon: documentIcon,
    title: 'Pengambilan',
    desc: <>Ambil di toko mitra terdekat. <span className="text-red">Wajib menyerahkan KTP fisik sebagai jaminan.</span></>,
  },
  {
    icon: sendIcon,
    title: 'Pengembalian',
    desc: 'Kembalikan alat dalam kondisi baik dan ambil kembali KTP Kamu.',
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