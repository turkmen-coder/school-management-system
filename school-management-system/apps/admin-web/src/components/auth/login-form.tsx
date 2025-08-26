import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { useAuth } from '@/providers/auth-provider'

interface LoginFormProps {
  onSuccess?: () => void
  type?: 'admin' | 'parent'
}

export function LoginForm({ onSuccess, type = 'admin' }: LoginFormProps) {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, requestOtp, verifyOtp } = useAuth()

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login({ email, password })
      onSuccess?.()
    } catch (error: any) {
      setError(error.message || 'Giriş başarısız')
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await requestOtp(phone)
      setStep('otp')
    } catch (error: any) {
      setError(error.message || 'SMS gönderimi başarısız')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await verifyOtp(phone, otp)
      onSuccess?.()
    } catch (error: any) {
      setError(error.message || 'Doğrulama başarısız')
    } finally {
      setLoading(false)
    }
  }

  if (type === 'admin') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Girişi</CardTitle>
          <CardDescription>
            Admin paneline erişmek için giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <Input
              type="email"
              label="E-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error && error.includes('email') ? error : undefined}
              required
            />
            <Input
              type="password"
              label="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error && error.includes('password') ? error : undefined}
              required
            />
            {error && !error.includes('email') && !error.includes('password') && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" loading={loading}>
              Giriş Yap
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Veli Girişi</CardTitle>
        <CardDescription>
          {step === 'phone' 
            ? 'Telefon numaranızı girin, size SMS ile kod gönderelim'
            : 'Size gönderilen 4 haneli kodu girin'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <Input
              type="tel"
              label="Telefon Numarası"
              placeholder="0555 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={error}
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              SMS Kodu Gönder
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpVerify} className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              <strong>{phone}</strong> numarasına kod gönderildi
            </div>
            <Input
              type="text"
              label="SMS Kodu"
              placeholder="1234"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
              error={error}
              maxLength={4}
              required
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep('phone')
                  setOtp('')
                  setError('')
                }}
                className="flex-1"
              >
                Geri
              </Button>
              <Button type="submit" className="flex-1" loading={loading}>
                Doğrula
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={handlePhoneSubmit}
              disabled={loading}
              className="w-full text-sm"
            >
              Kodu tekrar gönder
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}