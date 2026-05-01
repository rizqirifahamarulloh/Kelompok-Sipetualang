import { useState } from 'react'
import { Link } from 'react-router-dom'
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

export default function Login() {
  const { login } = useAuth()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await login(email, password)
      toast.success(t('auth.loginSuccess'))
    } catch (error) {
      const message =
        error.response?.data?.message || t('auth.genericError')
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* Background decorative elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Theme + Language toggles */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Back to home */}
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
            <CardTitle className="text-2xl font-bold">{t('auth.loginTitle')}</CardTitle>
            <CardDescription>{t('auth.loginSubtitle')}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t('auth.processing')}
                  </>
                ) : (
                  t('auth.loginButton')
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            <p className="text-center text-sm text-muted-foreground">
              {t('auth.noAccount')}{' '}
              <Link
                to="/register"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {t('auth.registerNow')}
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Demo credentials hint */}
        <Card className="border-dashed border-border/50 bg-muted/30">
          <CardContent className="py-3 px-4">
            <p className="text-xs text-muted-foreground text-center">
              <span className="font-medium">{t('auth.demo')}:</span>{' '}
              admin@sipetualang.com / password
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
