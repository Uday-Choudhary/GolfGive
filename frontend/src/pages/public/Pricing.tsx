import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  CalendarCheck,
  Check,
  HeartHandshake,
  Loader2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/auth'
import { Plan } from '@/types'

const featureGroups = [
  { label: 'Golf & Scoring', features: ['Stableford tracking (5 scores)', 'Mobile member dashboard'] },
  { label: 'Prize Draws', features: ['Automatic monthly entry', '3 Prize tiers', 'Jackpot rollovers'] },
  { label: 'Impact', features: ['10% to charity', 'Verified payout portal'] },
]

// Added the missing highlights array
const highlights = [
  { icon: Trophy, label: 'Win Big', text: 'Monthly jackpots and premium prizes' },
  { icon: HeartHandshake, label: 'Give Back', text: '10% goes directly to charity' },
  { icon: Zap, label: 'Track Scores', text: 'Live stableford tracking dashboard' }
]

export function Pricing() {
  const [plan, setPlan] = useState<Plan>('MONTHLY')
  const [isLoading, setIsLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  
  const { accessToken, setUser } = useAuthStore()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const hasConfirmedCheckout = useRef(false)

  const pricing = useMemo(() => ({
    MONTHLY: { price: '9.99', billed: 'Billed monthly', savings: null },
    YEARLY: { price: '7.99', billed: 'Billed £95.88 annually', savings: 'Save £24 per year' }
  }), [])

  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout')
    const sessionId = searchParams.get('session_id')
    const cancelled = searchParams.get('cancelled')

    if (cancelled === 'true') {
      setMessage({ type: 'info', text: 'Checkout was cancelled. You can try again anytime.' })
      return
    }

    if (checkoutStatus !== 'success' || !sessionId || !accessToken || hasConfirmedCheckout.current) {
      return
    }

    hasConfirmedCheckout.current = true
    setConfirming(true)

    api
      .post('/subscription/confirm', { sessionId })
      .then(() => api.get('/auth/me'))
      .then(({ data }) => {
        setUser(data)
        setMessage({ type: 'success', text: 'Subscription activated successfully.' })
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Could not confirm checkout. Please refresh and try again.' })
      })
      .finally(() => {
        setConfirming(false)
      })
  }, [accessToken, searchParams, setUser])

  const handleSubscribe = async () => {
    if (!accessToken) {
      navigate('/login')
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const { data } = await api.post('/subscription/checkout', { plan })
      if (data?.url) {
        window.location.href = data.url
        return
      }
      setMessage({ type: 'error', text: 'Checkout URL not returned. Please try again.' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error?.response?.data?.error || 'Failed to start checkout.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // Fixed invalid 'pt-18' to standard 'pt-24'
    <div className="min-h-screen bg-[#F9FAF9] pt-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 lg:py-32">
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1530028828-25e9ac4f7536?w=1800')] bg-cover bg-fixed bg-center" 
          aria-hidden="true"
        />
        {/* Adjusted gradient to ensure high contrast for text */}
        <div className="absolute inset-0 bg-gradient-to-br from-forest/95 via-forest/90 to-forest/60 backdrop-blur-[2px]" />
        
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Added a subtle float animation to the badge */}
              <motion.div 
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold backdrop-blur-md"
              >
                <Star className="h-3 w-3 fill-gold" />
                The Ultimate Golf Membership
              </motion.div>
              
              <h1 className="font-sans text-5xl font-bold uppercase tracking-tight leading-tight text-white md:text-7xl md:leading-[1.1]">
                Play for more <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral to-gold">
                  than just par.
                </span>
              </h1>
              
              <p className="mt-6 max-w-lg font-sans text-lg leading-relaxed text-white/90">
                Join the only community where your handicap helps charities and your scores enter you into monthly jackpot draws.
              </p>

              <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {highlights.map((h, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    key={i} 
                    className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:bg-white/10 hover:-translate-y-1"
                  >
                    <h.icon className="mb-3 h-6 w-6 text-gold transition-transform group-hover:scale-110" />
                    <p className="font-sans text-xs font-bold uppercase tracking-widest text-white">{h.label}</p>
                    <p className="mt-2 font-sans text-xs leading-relaxed text-white/60">{h.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Pricing Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative rounded-[32px] border border-white/40 bg-white p-2 shadow-[0_20px_50px_rgba(13,51,33,0.15)]"
            >
              {/* Plan Toggle */}
              <div className="flex rounded-3xl bg-off-white p-1.5 border border-stone">
                {(['MONTHLY', 'YEARLY'] as Plan[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setPlan(opt)}
                    className={`relative flex-1 rounded-[20px] py-3 text-xs font-sans font-bold uppercase tracking-widest transition-all duration-300 ${
                      plan === opt 
                        ? 'bg-forest text-white shadow-md ring-1 ring-forest/50' 
                        : 'text-slate hover:bg-stone/50 hover:text-forest'
                    }`}
                  >
                    {opt}
                    {opt === 'YEARLY' && (
                      <span className="absolute -right-2 -top-2 flex h-5 items-center rounded-full bg-gold px-2 text-[10px] text-forest font-bold shadow-sm animate-pulse">
                        -20%
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6 md:p-8">
                {/* Price Display with AnimatePresence for smooth transitions */}
                <div className="mb-8 flex items-end gap-2 h-20">
                  <AnimatePresence mode="wait">
                    <motion.span 
                      key={pricing[plan].price}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="font-mono text-6xl font-bold tracking-tight text-forest"
                    >
                      £{pricing[plan].price}
                    </motion.span>
                  </AnimatePresence>
                  <div className="mb-2">
                    <p className="font-sans text-sm font-bold text-slate">/ MONTH</p>
                    <p className="font-sans text-xs text-slate">{pricing[plan].billed}</p>
                  </div>
                </div>

                {/* Savings Badge */}
                <div className="h-10 mb-6">
                  <AnimatePresence>
                    {plan === 'YEARLY' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex w-fit items-center gap-2 rounded-xl bg-gold-pale px-4 py-2 text-sm font-semibold text-gold ring-1 ring-gold/20"
                      >
                        <Sparkles className="h-4 w-4 text-gold" />
                        {pricing.YEARLY.savings}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-6">
                  {featureGroups.map((group) => (
                    <div key={group.label}>
                      <p className="mb-3 font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-slate">{group.label}</p>
                      <ul className="space-y-2.5">
                        {group.features.map((f) => (
                          <li key={f} className="flex items-start gap-3 text-sm text-forest font-sans">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Status Message */}
                {message && (
                  <div className={`mt-6 rounded-xl font-sans p-3 text-sm text-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                  </div>
                )}

                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleSubscribe}
                  disabled={isLoading || confirming}
                  className="group mt-10 h-14 w-full text-base transition-all"
                >
                  {isLoading || confirming ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {accessToken ? 'Get Started' : 'Join GolfGive'}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>

                <div className="mt-6 flex justify-center gap-6 font-sans text-xs font-medium text-slate">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-slate" /> Secure checkout</span>
                  <span className="flex items-center gap-1.5"><CalendarCheck className="h-4 w-4 text-slate" /> Cancel anytime</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
      
      {/* Social Proof Stats */}
      <section className="border-t border-stone-200 bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 divide-y divide-stone-100 md:grid-cols-3 md:divide-x md:divide-y-0">
            {[
              { label: 'Charity Impact', val: '10%+', sub: 'From every single play' },
              { label: 'Active Draw', val: '£2,500', sub: 'Current monthly jackpot' },
              { label: 'Community', val: '12k+', sub: 'Golfers giving back' },
            ].map((stat, i) => (
              <div key={i} className="text-center md:px-8">
                <p className="font-mono text-4xl font-extrabold tracking-tight text-forest md:text-5xl">{stat.val}</p>
                <p className="mt-3 text-sm font-bold uppercase tracking-widest text-slate-900">{stat.label}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}