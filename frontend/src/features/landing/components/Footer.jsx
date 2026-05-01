import ScrollReveal from '@/components/ui/ScrollReveal'
import { useLanguage } from '@/contexts/LanguageContext'
import footerBg from '@/assets/beranda/BG-Footer-Section.png'
import logo from '@/assets/beranda/Logo.png'
import facebookIcon from '@/assets/beranda/Facebook Icon.svg'
import linkedinIcon from '@/assets/beranda/LinkedIn.svg'

export default function Footer() {
  const { t } = useLanguage()
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer id="footer" className="relative py-20 px-[60px] max-md:py-[60px] max-md:px-6 pb-0 overflow-hidden w-full box-border">
      <div className="absolute inset-0 z-0">
        <img src={footerBg} alt="" className="w-full h-full object-center max-md:object-cover" />
      </div>

      <div className="relative z-[1] max-w-[1200px] mx-auto w-full box-border">
        <ScrollReveal>
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] max-lg:grid-cols-2 max-md:grid-cols-1 gap-12 max-md:gap-10 pb-12 max-md:pb-8 border-b border-white/[0.08]">
            <div>
              <img src={logo} alt="SiPetualang" className="h-8 w-auto mb-5" />
              <p className="text-sm text-white/70 leading-relaxed mb-6 max-w-[280px] max-md:max-w-full">
                {t('footer.description')}
              </p>
              <div className="flex gap-3">
                <a href="#" className="flex items-center justify-center transition-transform duration-300 ease-in-out bg-white/5 w-10 h-10 rounded-full hover:scale-110 hover:-translate-y-0.5 hover:bg-white/10" aria-label="Facebook">
                  <img src={facebookIcon} alt="Facebook" className="w-5 h-5" />
                </a>
                <a href="#" className="flex items-center justify-center transition-transform duration-300 ease-in-out bg-white/5 w-10 h-10 rounded-full hover:scale-110 hover:-translate-y-0.5 hover:bg-white/10" aria-label="LinkedIn">
                  <img src={linkedinIcon} alt="LinkedIn" className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-base font-semibold text-white mb-6 tracking-[0.5px] max-md:px-5">
                {t('footer.aboutTitle')}
              </h4>
              <ul className="flex flex-col gap-4 list-none p-0 m-0 max-md:px-5">
                <li className="flex items-center gap-3 text-sm text-white/60 leading-normal">
                  <a href="#tentang-kami" className="text-white/60 transition-colors duration-300 ease-in-out no-underline hover:text-sp-primary">→ {t('footer.aboutUs')}</a>
                </li>
                <li className="flex items-center gap-3 text-sm text-white/60 leading-normal">
                  <a href="#cara-sewa" className="text-white/60 transition-colors duration-300 ease-in-out no-underline hover:text-sp-primary">{t('footer.howToRent')}</a>
                </li>
                <li className="flex items-center gap-3 text-sm text-white/60 leading-normal">
                  <a href="#cara-member" className="text-white/60 transition-colors duration-300 ease-in-out no-underline hover:text-sp-primary">{t('footer.howToMember')}</a>
                </li>
                <li className="flex items-center gap-3 text-sm text-white/60 leading-normal">
                  <a href="#cara-pengembalian" className="text-white/60 transition-colors duration-300 ease-in-out no-underline hover:text-sp-primary">{t('footer.howToReturn')}</a>
                </li>
                <li className="flex items-center gap-3 text-sm text-white/60 leading-normal">
                  <a href="#syarat-ketentuan" className="text-white/60 transition-colors duration-300 ease-in-out no-underline hover:text-sp-primary">{t('footer.terms')}</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-base font-semibold text-white mb-6 tracking-[0.5px] max-md:px-5">{t('footer.infoTitle')}</h4>
              <ul className="flex flex-col gap-4 list-none p-0 m-0 max-md:px-5">
                <li className="flex items-center gap-3 text-sm text-white/60 leading-normal">
                  <a href="#informasi-keamanan" className="text-white/60 transition-colors duration-300 ease-in-out no-underline hover:text-sp-primary">→ {t('footer.safetyInfo')}</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-base font-semibold text-white mb-6 tracking-[0.5px] max-md:px-5">{t('footer.helpTitle')}</h4>
              <ul className="flex flex-col gap-4 list-none p-0 m-0 max-md:px-5">
                <li className="flex items-center gap-3 text-sm text-white/60 leading-normal">
                  2307 Indonesia, Jawa Barat, Depok.
                </li>
                <li className="flex items-center gap-3 text-sm text-white/60 leading-normal">
                  <a href="mailto:Spetualang@7oroof.com" className="text-sp-primary transition-colors duration-300 ease-in-out no-underline hover:text-sp-primary-light">Spetualang@7oroof.com</a>
                </li>
                <li className="flex items-center gap-3 text-lg font-bold text-white leading-normal">
                  +62 011 6114 5741
                </li>
              </ul>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="flex items-center justify-between py-8 max-md:flex-col-reverse max-md:gap-8 max-md:text-center max-md:py-6 max-md:pb-10">
            <p className="text-sm text-white/50">
              ©2026 SiPetualang, All Rights Reserved. With Love by{' '}
              <a href="#" className="text-sp-primary no-underline">Spetualang.com</a>
            </p>

            <div className="flex gap-4 text-xs text-white/30">
              <a href="#terms" className="text-inherit no-underline">Terms &amp; Conditions</a>
              <a href="#privacy" className="text-inherit no-underline">Privacy Policy</a>
              <a href="#sitemap" className="text-inherit no-underline">Sitemap</a>
            </div>

            <button
              className="w-12 h-12 rounded-full bg-sp-primary text-white flex items-center justify-center transition-all duration-300 ease-in-out shadow-[0_6px_24px_rgba(42,181,115,0.35)] border-none cursor-pointer hover:bg-sp-primary-dark hover:shadow-[0_10px_30px_rgba(42,181,115,0.5)] hover:-translate-y-1"
              onClick={scrollToTop}
              aria-label="Scroll to top"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            </button>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  )
}
