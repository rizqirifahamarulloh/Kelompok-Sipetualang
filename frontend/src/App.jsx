import { useState, useEffect } from 'react'
import Navbar from './components/beranda/Navbar'
import Hero from './components/beranda/Hero'
import Information from './components/beranda/Information'
import HowItWorks from './components/beranda/HowItWorks'
import Category from './components/beranda/Category'
import Brand from './components/beranda/Brand'
import Testimonial from './components/beranda/Testimonial'
import Footer from './components/beranda/Footer'
import LoadingScreen from './components/beranda/LoadingScreen'

function App() {
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
    <>
      {isLoading ? (
        <LoadingScreen onComplete={() => setIsLoading(false)} />
      ) : (
        <main>
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
    </>
  )
}

export default App