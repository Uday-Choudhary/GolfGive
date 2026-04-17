import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Trophy, Upload, Check } from 'lucide-react'
import api from '@/lib/axios'
import { Winner } from '@/types'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PaymentStatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate, formatMonth } from '@/lib/utils'

const MATCH_LABELS: Record<string, string> = {
  FIVE: '5-Number Match (Jackpot)',
  FOUR: '4-Number Match',
  THREE: '3-Number Match',
}

export function Winnings() {
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const { data: winnings, isLoading } = useQuery<Winner[]>({
    queryKey: ['winnings'],
    queryFn: () => api.get('/winners/me').then((r) => r.data),
  })

  const totalWon = winnings?.reduce((sum, w) => sum + w.prizeAmount, 0) ?? 0

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-forest">My Winnings</h1>
        <p className="font-sans text-slate mt-1">Your prize history and payment status.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Total won */}
          {winnings && winnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-hero rounded-2xl p-8 text-center mb-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-draw-glow" />
              <p className="font-sans text-xs uppercase tracking-widest text-white/50 mb-2">Total Winnings</p>
              <p className="font-mono text-5xl font-semibold text-gold">{formatCurrency(totalWon)}</p>
            </motion.div>
          )}

          {/* Winnings list */}
          {winnings && winnings.length > 0 ? (
            <div className="space-y-4">
              {winnings.map((w, i) => (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-xl border border-stone p-5 shadow-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-heading text-lg text-forest">{MATCH_LABELS[w.matchType]}</p>
                      <p className="font-sans text-xs text-slate">
                        {w.draw ? formatMonth(w.draw.month) : formatDate(w.createdAt)} draw
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-mono text-xl font-semibold text-gold">{formatCurrency(w.prizeAmount)}</span>
                      <PaymentStatusBadge status={w.status} />
                    </div>
                  </div>

                  {/* Proof upload */}
                  {w.status === 'PENDING' && !w.proofUrl && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
                      <p className="font-sans text-xs text-amber-700">Upload proof of score to claim your prize</p>
                      <Button size="sm" variant="primary" onClick={() => setUploadingId(w.id)}>
                        <Upload className="w-3.5 h-3.5" /> Upload
                      </Button>
                    </div>
                  )}
                  {w.proofUrl && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-green-600 font-sans">
                      <Check className="w-4 h-4" /> Proof submitted — under review
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-slate font-sans">
              <Trophy className="w-12 h-12 text-stone mx-auto mb-3" />
              <p className="font-heading text-xl text-forest mb-2">No winnings yet</p>
              <p>Keep logging scores to increase your chances in the monthly draw!</p>
            </div>
          )}
        </>
      )}

      {/* Proof upload modal */}
      <Modal isOpen={!!uploadingId} onClose={() => setUploadingId(null)} title="Upload Proof of Score" size="sm">
        <p className="font-sans text-slate text-sm mb-4">
          Upload a screenshot from your golf platform showing your score for the relevant date. Accepted formats: PNG, JPG, WebP (max 5MB).
        </p>
        <input type="file" accept="image/png,image/jpeg,image/webp" className="w-full text-sm font-sans mb-4" />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setUploadingId(null)} className="flex-1 justify-center">Cancel</Button>
          <Button className="flex-1 justify-center">Submit Proof</Button>
        </div>
      </Modal>
    </div>
  )
}
