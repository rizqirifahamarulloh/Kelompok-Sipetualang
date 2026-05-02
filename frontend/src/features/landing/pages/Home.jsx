import { useState, useEffect } from 'react'
import '@/features/landing/landing.css'
import Navbar from '@/features/landing/components/Navbar'
import Hero from '@/features/landing/components/Hero'
import Information from '@/features/landing/components/Information'
import HowItWorks from '@/features/landing/components/HowItWorks'
import Category from '@/features/landing/components/Category'
import Brand from '@/features/landing/components/Brand'
import Testimonial from '@/features/landing/components/Testimonial'
import Footer from '@/features/landing/components/Footer'
import LoadingScreen from '@/features/landing/components/LoadingScreen'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
      window.scrollTo(0, 0)
    }
  }, [isLoading])

  return (
    <div className="landing-scrollbar">
      {isLoading ? (
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      ) : (
        <main className="w-full max-w-full overflow-x-hidden text-[#333] bg-white">
          <Navbar />
          <Hero />
          <Information />
          <HowItWorks />
          <Category />
          <Brand />
          <Testimonial />
          <Footer />
        </main>
      )}
    </div>
  )
}
