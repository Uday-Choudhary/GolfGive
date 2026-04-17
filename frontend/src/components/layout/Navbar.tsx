import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'How It Works', scrollTo: 'how' },
  { label: 'Charities', to: '/charities' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'FAQ', scrollTo: 'faq' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, accessToken } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isTransparent = isHome && !scrolled

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    handler()
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [location.pathname])

  const handleScrollLink = (id: string) => {
    setMenuOpen(false)
    if (location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isTransparent
            ? 'bg-transparent'
            : 'bg-white/95 backdrop-blur-md border-b border-stone shadow-sm'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors',
                isTransparent ? 'bg-gradient-hero' : 'bg-gradient-gold'
              )}
            >
              <span className="text-white text-xs font-bold font-mono">GG</span>
            </div>
            <span
              className={cn(
                'font-sans font-bold text-lg uppercase tracking-widest transition-colors',
                isTransparent ? 'text-white' : 'text-forest'
              )}
            >
              GolfGive
            </span>
          </Link>

          {/* Desktop Nav — center */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) =>
              link.scrollTo ? (
                <button
                  key={link.label}
                  onClick={() => handleScrollLink(link.scrollTo!)}
                  className={cn(
                    'px-4 py-2 rounded-full font-sans text-xs uppercase tracking-widest transition-colors duration-150',
                    isTransparent
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-ink hover:text-gold hover:bg-off-white'
                  )}
                >
                  {link.label}
                </button>
              ) : (
                <NavLink
                  key={link.label}
                  to={link.to!}
                  className={({ isActive }) =>
                    cn(
                      'px-4 py-2 rounded-full font-sans text-xs uppercase tracking-widest transition-colors duration-150',
                      isTransparent
                        ? isActive
                          ? 'text-gold bg-white/10'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                        : isActive
                        ? 'text-gold bg-gold-pale'
                        : 'text-ink hover:text-gold hover:bg-off-white'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
          </nav>

          {/* Right: Auth / CTA */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {accessToken ? (
              <button
                onClick={() => navigate(user?.role === 'ADMIN' ? '/admin' : '/dashboard')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full font-sans text-xs uppercase tracking-widest transition-all border',
                  isTransparent
                    ? 'border-white/30 text-white hover:border-white'
                    : 'border-stone text-ink hover:border-gold hover:text-gold'
                )}
              >
                <User className="w-3.5 h-3.5" />
                Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className={cn(
                    'font-sans text-xs uppercase tracking-widest transition-colors px-3 py-2 rounded-full',
                    isTransparent ? 'text-white/80 hover:text-white' : 'text-ink hover:text-gold'
                  )}
                >
                  Login
                </Link>
                <Button
                  variant={isTransparent ? 'glass' : 'primary'}
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Subscribe →
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={cn(
              'md:hidden p-2 rounded-lg transition-colors',
              isTransparent ? 'text-white' : 'text-forest'
            )}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile overlay menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-forest flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-18 border-b border-forest-mid">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                  <span className="text-white text-xs font-bold font-mono">GG</span>
                </div>
                <span className="font-sans font-bold text-lg uppercase tracking-widest text-white">GolfGive</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2 text-white/70 hover:text-white" aria-label="Close menu">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col px-8 pt-10 gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  {link.scrollTo ? (
                    <button
                      onClick={() => handleScrollLink(link.scrollTo!)}
                      className="w-full text-left py-4 font-sans font-bold text-2xl uppercase tracking-tight text-white/80 hover:text-gold transition-colors border-b border-forest-mid"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      to={link.to!}
                      className="block py-4 font-sans font-bold text-2xl uppercase tracking-tight text-white/80 hover:text-gold transition-colors border-b border-forest-mid"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </motion.div>
              ))}

              {accessToken ? (
                <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Link
                    to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                    className="block py-4 font-sans font-bold text-2xl uppercase tracking-tight text-white/80 hover:text-gold transition-colors border-b border-forest-mid"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Link
                    to="/login"
                    className="block py-4 font-sans font-bold text-2xl uppercase tracking-tight text-white/80 hover:text-gold transition-colors border-b border-forest-mid"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Link>
                </motion.div>
              )}
            </nav>

            <div className="mt-auto px-8 pb-12">
              <Button
                variant="primary"
                size="lg"
                onClick={() => { navigate('/register'); setMenuOpen(false) }}
                className="w-full justify-center"
              >
                Subscribe Now →
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
