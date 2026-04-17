import { motion } from 'framer-motion'
import { Trophy, AlertCircle } from 'lucide-react'
import { useDraws } from '@/hooks/useDraws'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { formatMonth, formatCurrency, formatDate } from '@/lib/utils'
import { DrawStatus } from '@/types'

function StatusBadge({ status }: { status: DrawStatus }) {
  const map: Record<DrawStatus, { variant: any; label: string }> = {
    PUBLISHED: { variant: 'success', label: 'Published' },
    SIMULATED: { variant: 'warning', label: 'Simulated' },
    PENDING: { variant: 'default', label: 'Upcoming' },
  }
  const { variant, label } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function DrawHistory() {
  const { data: draws, isLoading } = useDraws()

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-forest">Draw History</h1>
        <p className="font-sans text-slate mt-1">All published monthly draws and prize results.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : draws && draws.length > 0 ? (
        <div className="space-y-4">
          {draws.map((draw, i) => (
            <motion.div
              key={draw.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-stone p-6 shadow-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-heading text-xl text-forest">{formatMonth(draw.month)}</h3>
                  {draw.publishedAt && (
                    <p className="font-sans text-xs text-slate mt-0.5">Published {formatDate(draw.publishedAt)}</p>
                  )}
                </div>
                <StatusBadge status={draw.status} />
              </div>

              {/* Draw numbers */}
              {draw.drawNumbers.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-slate font-sans mb-2">Winning Numbers</p>
                  <div className="flex gap-2">
                    {draw.drawNumbers.map((n) => (
                      <div
                        key={n}
                        className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center"
                      >
                        <span className="font-mono text-sm font-semibold text-gold">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prize pools */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '5 Match (Jackpot)', amount: draw.jackpotPool },
                  { label: '4 Match', amount: draw.fourMatchPool },
                  { label: '3 Match', amount: draw.threeMatchPool },
                ].map(({ label, amount }) => (
                  <div key={label} className="p-3 rounded-lg bg-off-white text-center">
                    <p className="font-mono text-lg font-semibold text-forest">{formatCurrency(amount)}</p>
                    <p className="font-sans text-xs text-slate mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {draw.jackpotRolledOver && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 font-sans bg-amber-50 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Jackpot rolled over to next month (+{formatCurrency(draw.rolledOverAmount)})
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate font-sans">
          <Trophy className="w-12 h-12 text-stone mx-auto mb-3" />
          <p className="font-heading text-xl text-forest">No draws yet</p>
          <p>Published draw results will appear here.</p>
        </div>
      )}
    </div>
  )
}
