import { useState } from 'react'
import ScrollReveal from './ScrollReveal'
import './Testimonial.css'

const testimonials = [
  {
    quote: '"Carrier dan tenda yang saya sewa sangat nyaman digunakan selama 3 hari di Gunung Semeru Harga terjangkau dengan kualitas premium"',
    name: 'Budi Setiawan',
    role: 'Fotografer Alam',
    theme: 'green'
  },
  {
    quote: '"Pengalaman pertama sewa di SiPetualang langsung memuaskan Barang diantar tepat waktu dan kondisinya sangat baik Pasti sewa lagi"',
    name: 'Maya Putri',
    role: 'Adventure Enthusiast',
    theme: 'dark'
  },
  {
    quote: '"Cooking set dan sleeping bag yang disewakan sangat lengkap Membuat camping jadi lebih nyaman dan menyenangkan Terima kasih SiPetualang"',
    name: 'Riko Firmansyah',
    role: 'Camper',
    theme: 'light'
  },
  {
    quote: '"Pelayanan sangat ramah dan proses pengambilan barang super cepat Kondisi carrier masih terlihat baru dan terawat dengan sangat baik"',
    name: 'Dinda Shafira',
    role: 'Pendaki Pemula',
    theme: 'green'
  },
  {
    quote: '"Sangat membantu untuk pendakian rombongan Peralatan masak dan tenda kapasitas besar tersedia lengkap Sangat direkomendasikan"',
    name: 'Andi Pratama',
    role: 'Ketua Komunitas',
    theme: 'dark'
  }
]

function Testimonial() {
  const [activeCard, setActiveCard] = useState(null)

  const toggleCard = (index) => {
    setActiveCard(activeCard === index ? null : index)
  }

  return (
    <section id="testimonial" className="testimonial">
      <div className="testimonial__container">
        <ScrollReveal>
          <div className="testimonial__header">
            <span className="testimonial__badge">CERITA DARI JALUR PENDAKIAN</span>
            <h2 className="testimonial__title">
              Apa Kata Pelanggan Kami{'\n'}Tentang Layanan
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="testimonial__cards-wrapper">
            {testimonials.map((item, index) => (
              <div 
                key={index} 
                className={`testi-ui-card testi-ui-card-${index + 1} theme-${item.theme} ${activeCard === index ? 'active' : ''}`}
                onClick={() => toggleCard(index)}
              >
                <p className="testi-ui-quote">{item.quote}</p>
                <div className="testi-ui-profile">
                  <div className="testi-ui-avatar"></div>
                  <div className="testi-ui-info">
                    <h4 className="testi-ui-name">{item.name}</h4>
                    <span className="testi-ui-role">{item.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default Testimonial