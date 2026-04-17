import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Shuffle, Heart, Trophy, BarChart3, Menu, LogOut, Home, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const adminNav = [
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/draws', label: 'Draw Engine', icon: Shuffle },
  { to: '/admin/charities', label: 'Charities', icon: Heart },
  { to: '/admin/winners', label: 'Winners', icon: Trophy },
]

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { logout } = useAuth()
  const location = useLocation()
  const activeItem = adminNav.find((item) => location.pathname.startsWith(item.to))

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="relative px-5 py-5 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1592919505780-303950717480?w=900&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
            <span className="text-white text-xs font-bold font-mono">A</span>
          </div>
          <div>
            <p className="font-sans font-bold text-sm uppercase tracking-widest text-white">Admin Panel</p>
            <p className="text-xs text-white/55 font-sans">GolfGive operations</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-1.5">
        {adminNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
                isActive
                  ? 'bg-white text-forest shadow-lg shadow-black/10'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-sans text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mx-3 mb-3 rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
        <p className="font-sans text-xs uppercase tracking-widest text-white/50">Mode</p>
        <p className="mt-1 font-heading text-lg text-white">Live admin</p>
      </div>
      <div className="px-3 pb-4 pt-3 border-t border-white/10">
        <button
          onClick={() => logout.mutate()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/55 font-sans hover:bg-white/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-off-white">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col bg-gradient-hero fixed top-0 left-0 h-full w-64 z-30 overflow-hidden shadow-hero rounded-r-[32px] border-r border-white/10">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-stone flex items-center px-4 z-30 gap-3">
        <button onClick={() => setMobileOpen(true)} className="text-forest p-1.5">
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-sans font-bold text-sm uppercase tracking-widest text-forest">Admin Panel</span>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              className="md:hidden fixed left-0 top-0 h-full w-64 bg-gradient-hero z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="relative flex-1 min-h-screen overflow-hidden md:ml-64">
        <div className="absolute inset-x-0 top-0 h-64 bg-[url('https://images.unsplash.com/photo-1530028828-25e9ac4f7536?w=1600&auto=format&fit=crop')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/85 to-forest/55" />
          <div className="absolute inset-0 bg-draw-glow" />
        </div>
        <div className="md:hidden h-16" />
        <div className="relative w-full max-w-7xl mx-auto px-6 pt-7 md:px-10 md:pt-10">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4 text-white">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/15 px-3 py-1 text-xs font-sans uppercase tracking-widest text-gold">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin side
              </div>
              <p className="font-sans text-sm text-white/65">Platform controls and draw operations</p>
              <h2 className="font-sans text-3xl font-bold uppercase tracking-tight md:text-4xl">
                {activeItem?.label || 'Reports'}
              </h2>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-sans uppercase tracking-widest text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
          </div>
        </div>
        <div className="relative min-h-[calc(100vh-14rem)] rounded-t-[32px] bg-off-white shadow-[0_-18px_45px_rgba(13,51,33,0.12)] page-enter">
          <div className="mx-auto w-full max-w-7xl px-6 py-7 md:px-10 md:py-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
