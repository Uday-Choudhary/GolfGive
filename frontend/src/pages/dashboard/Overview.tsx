import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Star, Heart, TrendingUp, Plus, Clock } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useScores } from '@/hooks/useScores'
import { useCurrentDraw } from '@/hooks/useDraws'
import { SubStatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils'

function StatCard({ icon: Icon, label, value, color, delay }: {
  icon: any; label: string; value: string; color: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl p-6 border border-stone shadow-card"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="font-mono text-2xl font-semibold text-ink mb-1">{value}</p>
      <p className="font-sans text-xs uppercase tracking-widest text-slate">{label}</p>
    </motion.div>
  )
}

export function Overview() {
  const { user } = useAuthStore()
  const { data: scores, isLoading: scoresLoading } = useScores()
  const { data: currentDraw } = useCurrentDraw()
  const navigate = useNavigate()

  const avgScore = scores?.length
    ? Math.round(scores.reduce((s, v) => s + v.score, 0) / scores.length)
    : 0

  const daysUntilDraw = currentDraw
    ? getDaysUntil(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0))
    : null

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-forest">
            Welcome back, {user?.name?.split(' ')[0] || 'Golfer'} 👋
          </h1>
          <p className="font-sans text-slate mt-1">Here's how you're doing this month.</p>
        </div>
        <SubStatusBadge status={user?.subscriptionStatus || 'INACTIVE'} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={TrendingUp}
          label="Draw Status"
          value={scores && scores.length >= 3 ? 'Entered' : 'Add Scores'}
          color="bg-green-500"
          delay={0}
        />
        <StatCard
          icon={Star}
          label="Score Average"
          value={avgScore > 0 ? `${avgScore} pts` : '—'}
          color="bg-gold"
          delay={0.1}
        />
        <StatCard
          icon={Trophy}
          label="Total Won"
          value={formatCurrency(0)}
          color="bg-forest"
          delay={0.2}
        />
        <StatCard
          icon={Heart}
          label="Charity Given"
          value={formatCurrency(0)}
          color="bg-purple-500"
          delay={0.3}
        />
      </div>

      {/* Countdown banner */}
      {daysUntilDraw !== null && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-gold rounded-xl p-5 flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-white" />
            <div>
              <p className="font-heading text-lg text-white">Next Draw in {daysUntilDraw} days</p>
              <p className="font-sans text-sm text-white/80">
                Keep your scores up to date to stay entered
              </p>
            </div>
          </div>
          <Button variant="glass" size="sm" onClick={() => navigate('/dashboard/draws')}>
            View Draws
          </Button>
        </motion.div>
      )}

      {/* Score entry CTA */}
      {scoresLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-stone p-6 flex items-center justify-between"
        >
          <div>
            <h3 className="font-heading text-xl text-forest mb-1">Your Scores</h3>
            <p className="font-sans text-slate text-sm">
              {scores?.length ?? 0}/5 scores logged
              {scores && scores.length > 0 && ` · Latest: ${scores[0].score} pts on ${formatDate(scores[0].date)}`}
            </p>
          </div>
          <Button onClick={() => navigate('/dashboard/scores')}>
            <Plus className="w-4 h-4" />
            {scores && scores.length > 0 ? 'Add Score' : 'Log First Score'}
          </Button>
        </motion.div>
      )}
    </div>
  )
}
