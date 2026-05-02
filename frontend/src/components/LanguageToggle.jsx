import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'

export default function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLocale}
      title={locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
    >
      <span className="text-xs font-bold">{locale === 'id' ? 'EN' : 'ID'}</span>
      <span className="sr-only">
        {locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
      </span>
    </Button>
  )
}
