import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Information from './components/Information'
import HowItWorks from './components/HowItWorks'
import Category from './components/Category'
import Brand from './components/Brand'
import Testimonial from './components/Testimonial'
import Footer from './components/Footer'
import LoadingScreen from './components/LoadingScreen'

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