import { Link } from 'react-router-dom'
import { Heart, Twitter, Instagram, Linkedin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-forest text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-forest-mid">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                <span className="text-white text-xs font-bold font-mono">GG</span>
              </div>
              <span className="font-heading text-xl">GolfGive</span>
            </div>
            <p className="font-sans text-white/70 leading-relaxed max-w-xs">
              Play. Give. Win. Every score you submit supports a charity. Every subscription enters you in our monthly prize draw.
            </p>
            <div className="flex items-center gap-1.5 mt-4 text-sm text-gold font-sans">
              <Heart className="w-4 h-4 fill-current" />
              <span>10% of every subscription goes to good causes</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-sans text-xs uppercase tracking-widest text-white/50 mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {['How It Works', 'Charities', 'Pricing', 'Draw Results'].map((item) => (
                <li key={item}>
                  <Link
                    to={item === 'How It Works' ? '/#how' : `/${item.toLowerCase().replace(' ', '-')}`}
                    className="font-sans text-sm text-white/70 hover:text-gold transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-sans text-xs uppercase tracking-widest text-white/50 mb-4">Connect</h4>
            <div className="flex gap-3">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full border border-forest-mid flex items-center justify-center text-white/60 hover:text-gold hover:border-gold transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 font-sans">
          <p>© {new Date().getFullYear()} GolfGive Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
