import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Star, History, Heart, Trophy,
  LogOut, ChevronLeft, Menu, Home, User
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useAuth } from '@/hooks/useAuth'
import { SubStatusBadge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import api from '@/lib/axios'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/scores', label: 'My Scores', icon: Star },
  { to: '/dashboard/draws', label: 'Draw History', icon: History },
  { to: '/dashboard/charity', label: 'My Charity', icon: Heart },
  { to: '/dashboard/winnings', label: 'Winnings', icon: Trophy },
]

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuthStore()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const activeItem = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )

  const SidebarContent = ({ forceExpanded = false }: { forceExpanded?: boolean }) => {
    const showLabels = forceExpanded || !collapsed

    return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="relative px-5 py-5 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1530028828-25e9ac4f7536?w=900&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="relative flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center shrink-0 shadow-gold">
          <span className="text-white text-xs font-bold font-mono">GG</span>
        </div>
        {showLabels && (
          <div className="min-w-0">
            <span className="block font-sans font-bold text-sm uppercase tracking-widest text-white">GolfGive</span>
            <span className="block text-xs text-white/55 font-sans truncate">Member dashboard</span>
          </div>
        )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group',
                isActive
                  ? 'bg-white text-forest shadow-lg shadow-black/10'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {showLabels && <span className="font-sans text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Subscription widget */}
      {showLabels && user && (
        <div className="mx-3 mb-3 p-4 rounded-lg bg-white/10 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-white/50 font-sans uppercase tracking-wider">Status</p>
            <button 
              onClick={async () => {
                try {
                  const { data } = await api.get('/subscription/status')
                  const me = await api.get('/auth/me')
                  useAuthStore.getState().setUser(me.data)
                } catch (e) {
                  console.error("Failed to sync sub status", e)
                }
              }}
              className="text-[10px] uppercase text-gold hover:text-white transition-colors"
            >
              Sync
            </button>
          </div>
          <SubStatusBadge status={user.subscriptionStatus} />
          {user.subscriptionStatus !== 'ACTIVE' && (
            <button
              onClick={() => navigate('/pricing')}
              className="mt-3 w-full rounded-full bg-gold/20 px-3 py-2 text-xs text-gold font-sans hover:bg-gold/30 transition-colors"
            >
              Upgrade →
            </button>
          )}
        </div>
      )}

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3">
        <button
          onClick={() => logout.mutate()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-white/55 hover:text-red-300 hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {showLabels && <span className="font-sans text-sm">Logout</span>}
        </button>
      </div>
    </div>
  )}

  return (
    <div className="flex min-h-screen bg-off-white">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.2 }}
        className="hidden md:flex flex-col bg-gradient-hero fixed top-0 left-0 h-full z-30 overflow-hidden shrink-0 shadow-hero rounded-r-[32px] border-r border-white/10"
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-6 right-4 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </motion.aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-stone flex items-center px-4 z-30">
        <button onClick={() => setMobileOpen(true)} className="text-white p-1.5">
          <Menu className="w-5 h-5 text-forest" />
        </button>
        <span className="font-sans font-bold text-sm uppercase tracking-widest text-forest ml-3">GolfGive</span>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              className="md:hidden fixed left-0 top-0 h-full w-64 bg-gradient-hero z-50"
            >
              <SidebarContent forceExpanded />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main
        className={cn("relative flex-1 min-h-screen overflow-hidden transition-all duration-200", collapsed ? "md:ml-16" : "md:ml-64")}
      >
        <div className="absolute inset-x-0 top-0 h-64 bg-[url('https://images.unsplash.com/photo-1592919505780-303950717480?w=1600&auto=format&fit=crop')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/85 to-forest/55" />
          <div className="absolute inset-0 bg-draw-glow" />
        </div>
        <div className="md:hidden h-16" />
        <div className="relative w-full max-w-7xl mx-auto px-6 pt-7 md:px-10 md:pt-10">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4 text-white">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold/35 bg-gold/15 px-3 py-1 text-xs font-sans uppercase tracking-widest text-gold">
                <User className="h-3.5 w-3.5" />
                User side
              </div>
              <p className="font-sans text-sm text-white/65">Welcome back, {user?.name?.split(' ')[0] || 'Golfer'}</p>
              <h2 className="font-sans text-3xl font-bold uppercase tracking-tight md:text-4xl">
                {activeItem?.label || 'Dashboard'}
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
