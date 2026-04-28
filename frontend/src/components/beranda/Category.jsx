import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import cat1 from '../../assets/beranda/Card-Category-1.png'
import cat2 from '../../assets/beranda/Card-Category-2.png'
import cat3 from '../../assets/beranda/Card-Category-3.png'
import cat4 from '../../assets/beranda/Card-Category-4.png'
import cat5 from '../../assets/beranda/Card-Category-5.png'
import cat6 from '../../assets/beranda/Card-Category-6.png'
import cat7 from '../../assets/beranda/Card-Category-7.png'
import ScrollReveal from './ScrollReveal'
import './Category.css'

const categories = [
  { image: cat1, title: 'JaketGore tex Waterprof', available: '23 items available', tag: 'Popular' },
  { image: cat2, title: 'Sleeping Bag', available: '42 items available', tag: 'Best Seller' },
  { image: cat3, title: 'Carrier Eiger Escapade 25', available: '15 items available', tag: null },
  { image: cat4, title: 'Tenda Borneo Pro', available: '15 items available', tag: 'New' },
  { image: cat5, title: 'Forester Sepatu Mendaki', available: '10 items available', tag: null },
  { image: cat6, title: 'Trekking Pole', available: '24 items available', tag: null },
  { image: cat7, title: 'Emergency Blanket', available: '50 items available', tag: null },
]

function Category() {
  const [currentIndex, setCurrentIndex] = useState(2)

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === categories.length - 1 ? 0 : prevIndex + 1
    )
  }, [])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? categories.length - 1 : prevIndex - 1
    )
  }, [])

  useEffect(() => {
    const autoPlay = setInterval(() => {
      handleNext()
    }, 3000) // Bergeser setiap 3 detik

    return () => clearInterval(autoPlay)
  }, [handleNext])

  return (
    <section id="category" className="category">
      <div className="category__container">
        <ScrollReveal>
          <div className="category__header">
            <span className="information__badge">KEUNGGULAN PRODUK KAMI</span>
            <h2 className="category__title">
              Sewa Gear Outdoor{'\n'}Kini Lebih Mudah
            </h2>
            <p className="category__subtitle">
              Kamu cukup mengetik nama lokasi tujuan. Sistem kami merekomendasikan alat yang pas dengan kondisi alam di sana. Kamu bisa mengecek jumlah ketersediaan tenda atau carrier saat ini juga.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="category__carousel-wrapper">
            <div className="category__carousel">
              {categories.map((cat, index) => {
                let position = index - currentIndex
                let isActive = position === 0
                let zIndex = 10 - Math.abs(position)
                let scale = 1 - Math.abs(position) * 0.15
                let translateX = position * 65

                return (
                  <motion.div
                    key={index}
                    className={`category__card ${isActive ? 'active' : ''}`}
                    animate={{
                      x: `${translateX}%`,
                      scale: scale,
                      zIndex: zIndex,
                      opacity: Math.abs(position) > 2 ? 0 : 1,
                      filter: isActive ? 'brightness(1)' : 'brightness(0.4)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    onClick={() => setCurrentIndex(index)}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset }) => {
                      if (offset.x < -50) {
                        handleNext()
                      } else if (offset.x > 50) {
                        handlePrev()
                      }
                    }}
                  >
                    {cat.tag && (
                      <span className="category__tag">{cat.tag}</span>
                    )}
                    <img src={cat.image} alt={cat.title} className="category__card-bg" />
                    <div className="category__card-content">
                      <h3 className="category__card-title">{cat.title}</h3>
                      <div className="category__card-bottom">
                        <span className="category__card-available">{cat.available}</span>
                        <button className="category__card-btn">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="category__controls">
              <button className="category__nav-btn" onClick={handlePrev}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="category__dots">
                {categories.map((_, idx) => (
                  <span
                    key={idx}
                    className={`category__dot ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                  ></span>
                ))}
              </div>
              <button className="category__nav-btn" onClick={handleNext}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default Category