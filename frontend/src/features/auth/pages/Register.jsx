import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import ThemeToggle from '@/components/ThemeToggle'
import LanguageToggle from '@/components/LanguageToggle'
import { toast } from 'sonner'
import { Loader2, Mountain, ArrowLeft } from 'lucide-react'
import googleIcon from '@/assets/beranda/google.svg'

export default function Register() {
  const { register } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    role: 'penyewa',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.password !== form.password_confirmation) {
      toast.error(t('auth.passwordMismatch'))
      return
    }

    setIsSubmitting(true)

    try {
      await register(form)
      toast.success(t('auth.registerSuccess'))
      navigate('/login')
    } catch (error) {
      const data = error.response?.data
      if (data?.errors) {
        const firstError = Object.values(data.errors)[0]
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError)
      } else {
        toast.error(data?.message || t('auth.genericError'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/api/auth/google'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="fixed top-4 right-4 z-50 flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t('auth.backToHome')}
        </Link>

        <Card className="border-border/50 shadow-xl">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10">
              <Mountain className="size-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{t('auth.registerTitle')}</CardTitle>
            <CardDescription>{t('auth.registerSubtitle')}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('auth.fullName')}</Label>
                <Input id="name" type="text" value={form.name} onChange={updateField('name')} required disabled={isSubmitting} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input id="email" type="email" placeholder="nama@email.com" value={form.email} onChange={updateField('email')} required autoComplete="email" disabled={isSubmitting} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('auth.phone')}</Label>
                <Input id="phone" type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={updateField('phone')} required disabled={isSubmitting} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input id="password" type="password" value={form.password} onChange={updateField('password')} required minLength={8} autoComplete="new-password" disabled={isSubmitting} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">{t('auth.confirmPassword')}</Label>
                <Input id="password_confirmation" type="password" value={form.password_confirmation} onChange={updateField('password_confirmation')} required minLength={8} autoComplete="new-password" disabled={isSubmitting} />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label>{t('auth.registerAs')}</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="penyewa"
                      checked={form.role === 'penyewa'}
                      onChange={updateField('role')}
                      className="size-4 accent-primary"
                    />
                    <span className="text-sm">{t('auth.renter')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="pemilik"
                      checked={form.role === 'pemilik'}
                      onChange={updateField('role')}
                      className="size-4 accent-primary"
                    />
                    <span className="text-sm">{t('auth.owner')}</span>
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    {t('auth.processing')}
                  </>
                ) : (
                  t('auth.registerButton')
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              <img src={googleIcon} alt="Google" className="size-4 mr-2" />
              {t('auth.registerWithGoogle')}
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                {t('auth.loginNow')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
