import { Link } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import Navbar from '@/features/landing/components/Navbar'
import Footer from '@/features/landing/components/Footer'
import '@/features/landing/landing.css'

export default function SewaAlat() {
  const { t } = useLanguage()

  return (
    <div className="landing-scrollbar">
      <main className="w-full max-w-full overflow-x-hidden text-[#333] bg-white">
        <Navbar />
        <section className="min-h-screen flex items-center justify-center pt-32 pb-20 px-6">
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-sp-primary/10 mb-8">
              <svg className="w-10 h-10 text-sp-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
            </div>
            <h1 className="text-4xl max-md:text-3xl font-bold text-gray-900 mb-4">
              {t('nav.catalog')}
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
