import { Link } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import Navbar from '@/features/landing/components/Navbar'
import Footer from '@/features/landing/components/Footer'
import '@/features/landing/landing.css'

export default function CaraSewa() {
  const { t } = useLanguage()

  return (
    <div className="landing-scrollbar">
      <main className="w-full max-w-full overflow-x-hidden text-[#333] bg-white">
        <Navbar />
        <section className="min-h-screen flex items-center justify-center pt-32 pb-20 px-6">
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-sp-primary/10 mb-8">
              <svg className="w-10 h-10 text-sp-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h1 className="text-4xl max-md:text-3xl font-bold text-gray-900 mb-4">
              {t('nav.howItWorks')}
            </h1>
            <p className="text-lg text-gray-500 mb-8">
              {t('pages.comingSoon')}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-sp-primary text-white py-3 px-8 rounded-full text-sm font-semibold no-underline transition-all duration-300 hover:bg-sp-primary-dark hover:shadow-lg"
            >
              ← {t('auth.backToHome')}
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    </div>
  )
}
