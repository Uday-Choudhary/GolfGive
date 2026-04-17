import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ShieldCheck, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, LoginFormData } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const DEMO_CREDENTIALS = [
  {
    role: 'Admin',
    email: 'admin@golfgive.com',
    password: 'Admin@1234',
    icon: ShieldCheck,
    color: 'bg-forest/10 border-forest/30 text-forest hover:bg-forest/20',
    badge: 'bg-forest text-white',
  },
  {
    role: 'User',
    email: 'demo@golfgive.com',
    password: 'Demo@1234',
    icon: User,
    color: 'bg-gold/10 border-gold/30 text-gold hover:bg-gold/20',
    badge: 'bg-gold text-white',
  },
]

export function Login() {
  const { login } = useAuth()
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const fillCredentials = (email: string, password: string) => {
    setValue('email', email, { shouldValidate: true })
    setValue('password', password, { shouldValidate: true })
  }

  return (
    <div className="min-h-screen bg-off-white flex">
      {/* Left panel */}
      <div className="relative hidden lg:flex flex-col justify-between w-1/2 overflow-hidden bg-gradient-hero p-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1592919505780-303950717480?w=1600&auto=format&fit=crop)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/90 to-forest/70" />
        <Link to="/" className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
            <span className="text-white text-xs font-bold font-mono">GG</span>
          </div>
          <span className="font-sans font-bold text-lg uppercase tracking-widest text-white">GolfGive</span>
        </Link>
        <div className="relative max-w-md">
          <span className="mb-5 inline-block rounded-full border border-gold/35 bg-gold/15 px-4 py-1.5 text-xs font-sans uppercase tracking-widest text-gold">
            Member access
          </span>
          <h2 className="font-sans text-5xl font-bold uppercase tracking-tight text-white leading-[0.95] mb-5">
            Welcome<br />back, golfer.
          </h2>
          <p className="font-sans text-white/70 text-lg leading-relaxed">
            Your scores wait. The draw is coming. Log in and stay in the game.
          </p>
        </div>
        <p className="relative font-sans text-xs text-white/35">© 2026 GolfGive Ltd.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex items-center justify-between">
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center">
                <span className="text-white text-xs font-bold font-mono">GG</span>
              </div>
              <span className="font-sans font-bold text-base uppercase tracking-widest text-forest">GolfGive</span>
            </div>
            <Link
              to="/"
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-stone bg-white px-4 py-2 text-xs font-sans uppercase tracking-widest text-forest transition-colors hover:border-gold hover:text-gold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </Link>
          </div>

          <div className="rounded-[24px] border border-stone bg-white p-6 shadow-card md:p-8">
            <div className="hidden lg:flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center">
                <span className="text-white text-xs font-bold font-mono">GG</span>
              </div>
              <span className="font-sans font-bold text-base uppercase tracking-widest text-forest">GolfGive</span>
            </div>

            <h1 className="font-heading text-3xl text-forest mb-1">Sign In</h1>
            <p className="font-sans text-slate text-sm mb-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-gold hover:underline">Sign up</Link>
            </p>

            {/* Quick-fill demo buttons */}
            <div className="mb-6 p-4 rounded-2xl bg-off-white border border-stone">
              <p className="text-[10px] uppercase tracking-widest font-sans text-slate font-semibold mb-3">
                Quick Demo Access
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_CREDENTIALS.map(({ role, email, password, icon: Icon, color, badge }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => fillCredentials(email, password)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left ${color}`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${badge}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-sans font-bold text-xs">{role}</p>
                      <p className="font-sans text-[10px] opacity-70 truncate">{email}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] font-sans text-slate/60 mt-2 text-center">
                Click a role to auto-fill credentials
              </p>
            </div>

            <form onSubmit={handleSubmit((data) => login.mutate(data))} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                error={errors.email?.message}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Your password"
                {...register('password')}
                error={errors.password?.message}
              />

              {login.error && (
                <p className="text-sm text-red-500 font-sans">
                  {(login.error as any)?.response?.data?.error || 'Login failed. Please try again.'}
                </p>
              )}

              <Button
                type="submit"
                className="w-full justify-center"
                isLoading={login.isPending}
                size="lg"
              >
                Sign In →
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
