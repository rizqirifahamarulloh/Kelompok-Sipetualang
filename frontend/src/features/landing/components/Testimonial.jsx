import { useState } from 'react'
import { testimonials } from '@/features/landing/constants'
import ScrollReveal from '@/components/ui/ScrollReveal'

const THEME_CLASSES = {
  green: 'bg-emerald-200 text-emerald-900',
  dark: 'bg-[rgb(38,38,38)] text-white',
  light: 'bg-white text-[rgb(38,38,38)] border border-[rgb(230,230,230)]',
}

const CARD_POSITIONS = [
  'translate-x-[-160%] translate-y-[20px] -rotate-6 scale-90 z-[1]',
  'translate-x-[-80%] translate-y-[5px] rotate-[4deg] scale-95 z-[2]',
  'translate-x-0 -translate-y-2.5 -rotate-3 scale-105 z-[3] shadow-[0_20px_40px_rgba(0,0,0,0.15)]',
  'translate-x-[80%] translate-y-[5px] rotate-[5deg] scale-95 z-[2]',
  'translate-x-[160%] translate-y-[20px] -rotate-[5deg] scale-90 z-[1]',
]

const MOBILE_POSITIONS = [
  'max-md:!translate-x-0 max-md:!translate-y-[50px] max-md:!scale-100 max-md:!rotate-0 max-md:!z-[5]',
  'max-md:!translate-x-0 max-md:!translate-y-0 max-md:!scale-95 max-md:!rotate-0 max-md:!z-[4]',
  'max-md:!translate-x-0 max-md:!-translate-y-[50px] max-md:!scale-90 max-md:!rotate-0 max-md:!z-[3]',
  'max-md:!translate-x-0 max-md:!-translate-y-[90px] max-md:!scale-[0.85] max-md:!rotate-0 max-md:!z-[2]',
  'max-md:!translate-x-0 max-md:!-translate-y-[130px] max-md:!scale-[0.8] max-md:!rotate-0 max-md:!z-[1]',
]

export default function Testimonial() {
  const [activeCard, setActiveCard] = useState(null)

  const toggleCard = (index) => {
    setActiveCard(activeCard === index ? null : index)
  }

  return (
    <section id="testimonial" className="py-[100px] max-md:py-[60px] px-[5%] bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto text-center">
        <ScrollReveal>
          <div className="mb-20">
            <span className="text-sp-primary text-sm font-semibold uppercase tracking-[1px] block mb-4">
              CERITA DARI JALUR PENDAKIAN
            </span>
            <h2 className="text-[40px] max-md:text-[28px] font-bold text-[rgb(33,37,41)] leading-[1.3] whitespace-pre-line">
              {'Apa Kata Pelanggan Kami\nTentang Layanan'}
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="flex justify-center items-center relative h-[450px] max-md:h-[480px] w-full">
            {testimonials.map((item, index) => (
              <div
                key={index}
                className={`w-[300px] max-md:w-[90%] max-md:max-w-[320px] min-h-[280px] absolute rounded-[20px] py-8 px-6 flex flex-col justify-between text-left shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-[0.4s] ease-in-out cursor-pointer
                  ${THEME_CLASSES[item.theme]}
                  ${CARD_POSITIONS[index]}
                  ${MOBILE_POSITIONS[index]}
                  ${activeCard === index
                    ? '!z-[10] !scale-[1.15] !rotate-0 max-md:!-translate-y-[160px] max-md:!scale-105 max-md:!shadow-[0_15px_40px_rgba(0,0,0,0.2)]'
                    : ''
                  }
                  ${activeCard === index && index === 0
                    ? 'max-md:!translate-y-[40px] max-md:!scale-105 max-md:!shadow-[0_15px_40px_rgba(0,0,0,0.2)]'
                    : ''
                  }
                `}
                onClick={() => toggleCard(index)}
              >
                <p className="text-[15px] leading-relaxed font-medium mb-6">
                  {item.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[rgb(200,200,200)]">
                    <img src={item.avatar} alt={item.name} className="size-full rounded-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-bold mb-0.5">{item.name}</h4>
                    <span className="text-xs opacity-80">{item.role}</span>
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
