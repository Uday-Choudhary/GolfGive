import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Trophy, Zap, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatBar } from '@/components/ui/StatBar'
import { Accordion } from '@/components/ui/Accordion'
import { useCharities } from '@/hooks/useCharities'
import { useDraws } from '@/hooks/useDraws'
import { formatCurrency, formatMonth } from '@/lib/utils'

/* ─── Static data ────────────────────────────────────────────────── */

const stats = [
  { value: 3240, label: 'Subscribers' },
  { value: 58200, label: 'Prize Pool', isCurrency: true },
  { value: 12480, label: 'Charity Raised', isCurrency: true },
  { value: 24, label: 'Draws Run' },
]

const features = [
  {
    Icon: Trophy,
    title: 'Expert Draw System',
    desc: 'Certified fair monthly draws using your real Stableford scores. No algorithms — just your game.',
    stat: '24+',
    statLabel: 'Draws Run',
    dark: true,
    img: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&auto=format&fit=crop',
  },
  {
    Icon: Zap,
    title: 'Seamless Platform',
    desc: 'Fast, secure score logging. Submit your five most recent Stableford scores in seconds from any device.',
    stat: '10K+',
    statLabel: 'Happy Golfers',
    dark: false,
    img: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&auto=format&fit=crop',
  },
  {
    Icon: Heart,
    title: 'Exclusive Prizes & Charity',
    desc: 'Win monthly from a growing prize pool while automatically supporting a charity you care about.',
    stat: '10%+',
    statLabel: 'Auto-Donated',
    dark: true,
    img: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=600&auto=format&fit=crop',
  },
]

const steps = [
  {
    num: '01',
    title: 'Log Your Scores',
    desc: 'Submit up to 5 Stableford scores per month. Your latest scores are always used for the draw.',
  },
  {
    num: '02',
    title: 'Monthly Draw',
    desc: 'Five numbers are drawn each month. Match 3, 4, or 5 to win from three prize tiers.',
  },
  {
    num: '03',
    title: 'Charity Impact',
    desc: 'At least 10% of your subscription auto-donates to a charity you choose. Every month.',
  },
]

const faqs = [
  {
    question: 'How does the monthly draw work?',
    answer:
      'Five numbers between 1–45 are drawn each month. Your five most recent Stableford scores are your draw numbers. Match 3, 4, or all 5 to win from the prize pool. The jackpot rolls over if nobody matches all 5.',
  },
  {
    question: 'What is Stableford scoring?',
    answer:
      'Stableford is a golf scoring format where points are awarded based on your performance on each hole relative to par. A typical round score ranges from 20–45 points for a regular club golfer.',
  },
  {
    question: 'How is the prize pool calculated?',
    answer:
      'The prize pool is built from monthly subscription revenue, minus a minimum 10% charity contribution. 40% goes to the jackpot (5-match), 35% to the 4-match prize, and 25% to the 3-match prize.',
  },
  {
    question: 'How do I claim a prize?',
    answer:
      'If you win, we email you immediately. You then upload a screenshot of your scores from your golf platform (Handicap Index, Golf Genius, etc.) as proof. Our admin team reviews and processes payment within 7 days.',
  },
  {
    question: 'Can I change my charity?',
    answer:
      'Yes! You can update your charity at any time from your dashboard, or adjust your contribution percentage (minimum 10%).',
  },
  {
    question: 'Is the subscription auto-renewing?',
    answer:
      'Yes. Subscriptions auto-renew monthly or yearly, depending on your plan. You can cancel at any time from your dashboard — you keep access until the end of your current billing period.',
  },
]

const trustedBrands = ['Golf Genius', 'England Golf', 'HowDidiDo', 'MyRound', 'R&A Golf', 'BRS Golf']

const gatewayStats = [
  { n: '3,240+', l: 'Active Members' },
  { n: '£58K+', l: 'Total Prize Pool' },
  { n: '30 Day', l: 'Free Trial' },
  { n: '24', l: 'Draws Run' },
]

/* ─── Draw number ball ───────────────────────────────────────────── */
function DrawNumberBall({ n, delay }: { n: number; delay: number }) {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.6, type: 'spring', bounce: 0.5 }}
      viewport={{ once: true }}
      className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold"
    >
      <span className="font-mono font-semibold text-lg text-white">{n}</span>
    </motion.div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────── */
export function Home() {
  const navigate = useNavigate()
  const { data: charities } = useCharities({ featured: true })
  const { data: draws } = useDraws()
  const latestDraw = draws?.[0]

  return (
    <div className="overflow-x-hidden">

      {/* ══ 1. HERO ════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center">
        {/* BG image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1530028828-25e9ac4f7536?w=1800&auto=format&fit=crop)',
          }}
        />
        {/* Directional overlay: dark left → transparent right */}
        <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/80 to-forest/30" />
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-draw-glow pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-24 w-full grid md:grid-cols-2 gap-12 items-center">

          {/* Left: headline + CTA */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block mb-5 px-4 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-sans uppercase tracking-widest"
            >
              Golf · Charity · Monthly Prizes
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-sans font-bold text-white uppercase tracking-tight leading-[0.93] mb-6"
              style={{ fontSize: 'clamp(3.2rem, 8vw, 6.5rem)' }}
            >
              Log Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral to-gold">
                Scores,
              </span>
              <br />
              Win Big.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-sans text-lg text-white/70 max-w-md mb-10 leading-relaxed"
            >
              Premium golf draw platform — submit your Stableford scores, enter monthly prize draws, and automatically give to a charity you love.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap gap-4"
            >
              <Button size="lg" onClick={() => navigate('/register')}>
                Subscribe Now <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="glass"
                size="lg"
                onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
              >
                How It Works
              </Button>
            </motion.div>
          </motion.div>

          {/* Right: floating card + badge */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden md:flex justify-center items-center"
          >
            <div className="relative">
              {/* Main image card */}
              <div className="w-72 h-96 rounded-2xl overflow-hidden shadow-hero border border-white/20">
                <img
                  src="https://images.unsplash.com/photo-1592919505780-303950717480?w=600&auto=format&fit=crop"
                  alt="Golfer"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Prize pool badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.4, type: 'spring' }}
                className="absolute -bottom-5 -left-10 bg-white rounded-2xl px-5 py-4 shadow-xl"
              >
                <p className="font-mono text-2xl font-bold text-forest leading-none">£58K+</p>
                <p className="text-xs text-slate font-sans uppercase tracking-widest mt-0.5">Prize Pool</p>
              </motion.div>
              {/* Members badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, duration: 0.4, type: 'spring' }}
                className="absolute -top-5 -right-8 bg-coral rounded-2xl px-4 py-3 shadow-gold"
              >
                <p className="font-mono text-xl font-bold text-white leading-none">3.2K+</p>
                <p className="text-xs text-white/80 font-sans uppercase tracking-widest mt-0.5">Members</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Wave to off-white */}
        <div className="wave-divider absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="h-20 w-full">
            <path fill="#F8F6F2" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* ══ 2. TRUST BAR ═══════════════════════════════════════════════════ */}
      <section className="bg-off-white py-10">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs uppercase tracking-widest text-slate/60 font-sans mb-8">
            As Seen On
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {trustedBrands.map((brand) => (
              <span
                key={brand}
                className="font-sans font-bold text-slate/40 uppercase tracking-widest text-sm hover:text-slate/70 transition-colors cursor-default"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 3. WHY CHOOSE US ═══════════════════════════════════════════════ */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-gold font-sans font-medium">Our Service</span>
            <h2 className="font-sans font-bold uppercase tracking-tight text-4xl md:text-5xl text-forest mt-2">
              Why Choose Us?
            </h2>
            <p className="font-sans text-slate text-lg mt-3 max-w-lg mx-auto">
              Everything you need to play, give, and win — all in one premium platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.13, duration: 0.5 }}
                viewport={{ once: true }}
                className={`relative rounded-2xl overflow-hidden shadow-md group ${
                  f.dark ? 'bg-forest' : 'bg-off-white'
                }`}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={f.img}
                    alt={f.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
                </div>

                {/* Content */}
                <div className={`p-6 ${f.dark ? 'text-white' : 'text-forest'}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
                      f.dark ? 'bg-gold/20' : 'bg-forest/10'
                    }`}
                  >
                    <f.Icon
                      className={`w-5 h-5 ${f.dark ? 'text-gold' : 'text-forest'}`}
                    />
                  </div>
                  <h3 className="font-sans font-bold text-lg uppercase tracking-tight mb-2">
                    {f.title}
                  </h3>
                  <p
                    className={`font-sans text-sm leading-relaxed mb-5 ${
                      f.dark ? 'text-white/65' : 'text-slate'
                    }`}
                  >
                    {f.desc}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`font-mono text-2xl font-bold ${
                        f.dark ? 'text-gold' : 'text-forest'
                      }`}
                    >
                      {f.stat}
                    </span>
                    <span
                      className={`text-xs uppercase tracking-widest font-sans ${
                        f.dark ? 'text-white/40' : 'text-slate'
                      }`}
                    >
                      {f.statLabel}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. GATEWAY — dark split ════════════════════════════════════════ */}
      <section className="bg-forest relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-stretch">
          {/* Left: text + mini stats */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="px-8 md:px-14 py-20 md:py-28 flex flex-col justify-center"
          >
            <span className="text-xs uppercase tracking-widest text-gold font-sans font-medium mb-4">
              Monthly Draw
            </span>
            <h2
              className="font-sans font-bold uppercase tracking-tight text-4xl md:text-5xl text-white leading-[1] mb-6"
            >
              Your Gateway to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-light">
                the Perfect Draw
              </span>
            </h2>
            <p className="font-sans text-white/60 text-lg mb-10 max-w-md leading-relaxed">
              Your latest Stableford scores become your lucky numbers. Match 3, 4, or all 5 to win from our monthly prize pool.
            </p>

            {/* Mini stats grid */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {gatewayStats.map(({ n, l }) => (
                <div key={l} className="p-4 rounded-xl bg-white/8 border border-white/10 backdrop-blur-sm">
                  <p className="font-mono text-2xl font-bold text-gold">{n}</p>
                  <p className="text-xs uppercase tracking-widest text-white/45 font-sans mt-0.5">{l}</p>
                </div>
              ))}
            </div>

            <div>
              <Button size="lg" onClick={() => navigate('/register')}>
                Join the Draw <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Right: full-bleed image */}
          <div className="hidden md:block relative min-h-[480px]">
            <img
              src="https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=900&auto=format&fit=crop"
              alt="Golfers on course"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* ══ 5. CHARITY GALLERY ═════════════════════════════════════════════ */}
      {charities && charities.length > 0 && (
        <section className="py-24 bg-off-white px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs uppercase tracking-widest text-gold font-sans font-medium">Impact</span>
              <h2 className="font-sans font-bold uppercase tracking-tight text-4xl md:text-5xl text-forest mt-2">
                Explore Our Charities
              </h2>
              <p className="font-sans text-slate text-lg mt-3 max-w-lg mx-auto">
                Choose a cause that matters to you. At least 10% of your subscription goes directly to them, every month.
              </p>
            </div>

            {/* Spotlight */}
            {charities[0] && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative rounded-2xl overflow-hidden mb-8 h-72 md:h-96 cursor-pointer group"
                onClick={() => navigate('/charities')}
              >
                <img
                  src={
                    charities[0].imageUrls[0] ||
                    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200'
                  }
                  alt={charities[0].name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 card-overlay" />
                <div className="absolute bottom-0 left-0 p-8">
                  <span className="inline-block px-3 py-1 rounded-full bg-coral text-white text-xs font-sans uppercase tracking-wider mb-3">
                    Featured Charity
                  </span>
                  <h3 className="font-sans font-bold text-3xl text-white uppercase tracking-tight mb-2">
                    {charities[0].name}
                  </h3>
                  <p className="font-sans text-white/80 max-w-lg">{charities[0].mission}</p>
                </div>
              </motion.div>
            )}

            {/* Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {charities.slice(1, 4).map((charity, i) => (
                <motion.div
                  key={charity.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="rounded-2xl overflow-hidden bg-white shadow-card border border-stone hover:-translate-y-1.5 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => navigate('/charities')}
                >
                  <div className="h-44 overflow-hidden">
                    <img
                      src={
                        charity.imageUrls[0] ||
                        'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400'
                      }
                      alt={charity.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-coral font-sans uppercase tracking-wider font-semibold">
                      {charity.category}
                    </span>
                    <h4 className="font-sans font-bold text-lg text-forest uppercase tracking-tight mt-1">
                      {charity.name}
                    </h4>
                    <p className="font-sans text-slate text-sm mt-1 line-clamp-2">{charity.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button variant="secondary" onClick={() => navigate('/charities')}>
                Explore All Charities <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ══ 6. MISSION — Built by Golfers ══════════════════════════════════ */}
      <section className="bg-forest-mid py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-draw-glow pointer-events-none opacity-40" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Left: overlapping images */}
            <div className="relative h-80 hidden md:block">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="absolute top-0 left-0 w-56 h-64 rounded-2xl overflow-hidden shadow-xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=400&auto=format&fit=crop"
                  alt="Golf equipment"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                viewport={{ once: true }}
                className="absolute bottom-0 right-0 w-56 h-64 rounded-2xl overflow-hidden shadow-xl border-4 border-forest-mid"
              >
                <img
                  src="https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&auto=format&fit=crop"
                  alt="Golf course"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              {/* Centre badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3, type: 'spring' }}
                viewport={{ once: true }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold rounded-2xl px-5 py-4 shadow-gold text-center"
              >
                <p className="font-mono text-2xl font-bold text-white leading-none">10%</p>
                <p className="text-xs text-white/80 font-sans uppercase tracking-wider mt-0.5">Min Charity</p>
              </motion.div>
            </div>

            {/* Right: text */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <span className="text-xs uppercase tracking-widest text-gold font-sans font-medium">Our Mission</span>
              <h2 className="font-sans font-bold uppercase tracking-tight text-4xl md:text-5xl text-white leading-[1] mt-2 mb-6">
                Built by Golfers,
                <br />
                <span className="text-gold">Driven by Passion</span>
              </h2>
              <p className="font-sans text-white/65 text-lg leading-relaxed mb-10">
                GolfGive was born on the golf course. We're passionate golfers who wanted every round to count for more than fun — combining the thrill of competition with the joy of giving back.
              </p>

              <div className="grid grid-cols-3 gap-6">
                {[
                  { n: '500+', l: 'Club Members' },
                  { n: '30', l: 'Day Trial' },
                  { n: '50+', l: 'Charities' },
                ].map(({ n, l }) => (
                  <div key={l} className="text-center">
                    <p className="font-mono text-3xl font-bold text-gold leading-none">{n}</p>
                    <p className="text-xs uppercase tracking-widest text-white/45 font-sans mt-1">{l}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ 7. STAT BAR ════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 px-6 border-b border-stone">
        <div className="max-w-4xl mx-auto">
          <StatBar stats={stats} />
        </div>
      </section>

      {/* ══ 8. HOW IT WORKS ════════════════════════════════════════════════ */}
      <section id="how" className="py-24 bg-off-white px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-gold font-sans font-medium">The Platform</span>
            <h2 className="font-sans font-bold uppercase tracking-tight text-4xl md:text-5xl text-forest mt-2">
              From Beginners to Pros,
              <br />
              We Grow Together
            </h2>
            <p className="font-sans text-slate text-lg mt-3 max-w-lg mx-auto">
              Three simple steps — score logging, monthly draws, and charity giving — perfectly combined.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
                className="relative p-8 rounded-2xl border border-stone bg-white shadow-card hover:shadow-lg hover:-translate-y-1.5 transition-all group"
              >
                <span className="font-mono text-5xl font-semibold text-stone group-hover:text-gold/40 transition-colors">
                  {step.num}
                </span>
                <h3 className="font-sans font-bold text-xl text-forest uppercase tracking-tight mt-4 mb-3">
                  {step.title}
                </h3>
                <p className="font-sans text-slate leading-relaxed">{step.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-stone" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 9. DRAW PREVIEW ════════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-hero px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-draw-glow pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-xs uppercase tracking-widest text-gold font-sans font-medium">Monthly Draw</span>
          <h2 className="font-sans font-bold uppercase tracking-tight text-4xl md:text-5xl text-white mt-2 mb-4">
            {latestDraw ? `${formatMonth(latestDraw.month)} Results` : "Last Month's Draw"}
          </h2>
          <p className="font-sans text-white/60 mb-12">
            Match 3, 4, or all 5 numbers to win from the prize pool
          </p>

          {/* Draw balls */}
          <div className="flex items-center justify-center gap-4 mb-14">
            {(latestDraw?.drawNumbers.length ? latestDraw.drawNumbers : [7, 15, 22, 31, 38]).map(
              (n, i) => <DrawNumberBall key={i} n={n} delay={i * 0.12} />
            )}
          </div>

          {/* Prize tiers */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            {[
              { match: '5 Match', label: 'Jackpot', pct: '40%', amount: latestDraw?.jackpotPool },
              { match: '4 Match', label: 'Prize', pct: '35%', amount: latestDraw?.fourMatchPool },
              { match: '3 Match', label: 'Prize', pct: '25%', amount: latestDraw?.threeMatchPool },
            ].map(({ match, label, pct, amount }) => (
              <div
                key={match}
                className="p-5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-center"
              >
                <p className="text-xs uppercase tracking-widest text-white/50 font-sans">{match}</p>
                <p className="font-mono text-2xl font-semibold text-gold mt-1">
                  {amount ? formatCurrency(amount) : pct}
                </p>
                <p className="text-xs text-white/40 font-sans mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <Button size="lg" onClick={() => navigate('/register')}>
            Enter Next Draw <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="wave-divider absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="h-20 w-full">
            <path fill="#FFFFFF" d="M0,40 C360,0 1080,80 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* ══ 10. PRICING CTA ════════════════════════════════════════════════ */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-forest px-10 py-16 md:py-20 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-draw-glow pointer-events-none" />
            <div className="relative z-10">
              <span className="text-xs uppercase tracking-widest text-gold font-sans font-medium">Get Started</span>
              <h2 className="font-sans font-bold uppercase tracking-tight text-4xl md:text-5xl text-white mt-2 mb-4">
                Join from £7.99 / month
              </h2>
              <p className="font-sans text-white/60 text-lg mb-8">
                Monthly or yearly subscription. Cancel any time. Your first draw is the month you join.
              </p>
              <div className="flex flex-wrap gap-4 justify-center items-center mb-10">
                {['Score tracking', 'Monthly draws', 'Charity giving', 'Winner verification'].map((f) => (
                  <span key={f} className="flex items-center gap-1.5 text-sm text-white/70 font-sans">
                    <Check className="w-4 h-4 text-gold shrink-0" />
                    {f}
                  </span>
                ))}
              </div>
              <Button size="lg" onClick={() => navigate('/pricing')}>
                View Pricing <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ 11. FAQ ════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-24 bg-off-white px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-forest text-white text-xs font-sans uppercase tracking-widest mb-5">
              Have Questions?
            </span>
            <h2 className="font-sans font-bold uppercase tracking-tight text-4xl text-forest">
              Frequently Asked
            </h2>
          </div>
          <Accordion items={faqs} />
        </div>
      </section>

    </div>
  )
}
