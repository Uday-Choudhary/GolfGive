import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useCharities } from '@/hooks/useCharities'
import { registerSchema, RegisterFormData } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Check } from 'lucide-react'

// Need to install @hookform/resolvers
export function Register() {
  const [step, setStep] = useState(1)
  const [selectedCharity, setSelectedCharity] = useState<string>('')
  const { register: registerUser } = useAuth()
  const { data: charities } = useCharities()

  const { register, handleSubmit, formState: { errors }, getValues, trigger } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const handleNext = async () => {
    const valid = await trigger(['name', 'email', 'password'])
    if (valid) setStep(2)
  }

  const onSubmit = (data: RegisterFormData) => {
    registerUser.mutate({ ...data, charityId: selectedCharity || undefined })
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
            Golf · Charity · Prizes
          </span>
          <h2 className="font-sans text-5xl font-bold uppercase tracking-tight text-white leading-[0.95] mb-5">
            Join the<br />movement.
          </h2>
          <p className="font-sans text-white/70 text-lg leading-relaxed">
            Play golf. Win prizes. Support a charity that matters to you. All for less than a round of drinks.
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

          <div className="rounded-lg border border-stone bg-white p-6 shadow-card md:p-8">
          <div className="hidden lg:flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center">
              <span className="text-white text-xs font-bold font-mono">GG</span>
            </div>
            <span className="font-sans font-bold text-base uppercase tracking-widest text-forest">GolfGive</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  s < step ? 'bg-forest text-white' : s === step ? 'bg-gold text-white' : 'bg-stone text-slate'
                }`}>
                  {s < step ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                {s < 2 && <div className={`h-0.5 w-12 transition-colors ${s < step ? 'bg-forest' : 'bg-stone'}`} />}
              </div>
            ))}
            <span className="ml-2 text-xs text-slate font-sans">{step === 1 ? 'Account' : 'Choose Charity'}</span>
          </div>

          <h1 className="font-heading text-3xl text-forest mb-1">
            {step === 1 ? 'Create Account' : 'Choose a Charity'}
          </h1>
          <p className="font-sans text-slate text-sm mb-8">
            {step === 1 ? (
              <>Already have an account? <Link to="/login" className="text-gold hover:underline">Sign in</Link></>
            ) : (
              'Select the charity that will receive 10% of your subscription.'
            )}
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div className="space-y-5">
                <Input label="Full Name" placeholder="Alex Johnson" {...register('name')} error={errors.name?.message} />
                <Input label="Email Address" type="email" placeholder="you@example.com" {...register('email')} error={errors.email?.message} />
                <Input label="Password" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" {...register('password')} error={errors.password?.message} />
                <Button
                  type="button"
                  className="w-full justify-center"
                  size="lg"
                  onClick={handleNext}
                >
                  Continue
                </Button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-5">
                  {charities?.map((charity) => (
                    <button
                      key={charity.id}
                      type="button"
                      onClick={() => setSelectedCharity(charity.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        selectedCharity === charity.id
                          ? 'border-gold bg-gold-pale'
                          : 'border-stone bg-white hover:border-forest/30'
                      }`}
                    >
                      {charity.imageUrls[0] && (
                        <img src={charity.imageUrls[0]} alt={charity.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      )}
                      <div>
                        <p className="font-heading text-sm text-forest">{charity.name}</p>
                        <p className="font-sans text-xs text-slate line-clamp-1">{charity.mission}</p>
                      </div>
                      {selectedCharity === charity.id && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-gold flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {registerUser.error && (
                  <p className="text-sm text-red-500 font-sans mb-4">
                    {(registerUser.error as any)?.response?.data?.error || 'Registration failed.'}
                  </p>
                )}

                <div className="flex gap-3">
                  <Button variant="secondary" type="button" onClick={() => setStep(1)} className="flex-1 justify-center">
                    Back
                  </Button>
                  <Button
                    type="submit"
                    isLoading={registerUser.isPending}
                    className="flex-1 justify-center"
                  >
                    {selectedCharity ? 'Create Account' : 'Skip & Create Account'}
                  </Button>
                </div>
              </div>
            )}
          </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
