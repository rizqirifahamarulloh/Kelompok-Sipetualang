import { Link } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import Navbar from '@/features/landing/components/Navbar'
import Footer from '@/features/landing/components/Footer'
import '@/features/landing/landing.css'

export default function BukaRental() {
  const { t } = useLanguage()

  return (
    <div className="landing-scrollbar">
      <main className="w-full max-w-full overflow-x-hidden text-[#333] bg-white">
        <Navbar />
        <section className="min-h-screen flex items-center justify-center pt-32 pb-20 px-6">
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-sp-primary/10 mb-8">
              <svg className="w-10 h-10 text-sp-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
            </div>
            <h1 className="text-4xl max-md:text-3xl font-bold text-gray-900 mb-4">
              {t('nav.about')}
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
