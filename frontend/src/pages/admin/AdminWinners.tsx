import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle, DollarSign } from 'lucide-react'
import api from '@/lib/axios'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { PaymentStatusBadge } from '@/components/ui/Badge'
import { Winner } from '@/types'
import { formatCurrency, formatDate, formatMonth } from '@/lib/utils'

const MATCH_LABELS: Record<string, string> = {
  FIVE: 'Jackpot (5-match)',
  FOUR: '4-match',
  THREE: '3-match',
}

export function AdminWinners() {
  const qc = useQueryClient()

  const { data: winners, isLoading } = useQuery<Winner[]>({
    queryKey: ['admin-winners'],
    queryFn: () => api.get('/admin/winners').then((r) => r.data),
  })

  const payout = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/winners/${id}/payout`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-winners'] }),
  })

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-forest">Winners & Verification</h1>
        <p className="font-sans text-slate mt-1">Review winner proof submissions and process payouts.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-stone overflow-hidden shadow-card">
          <table className="w-full">
            <thead>
              <tr className="bg-forest">
                {['Winner', 'Draw Month', 'Match', 'Prize', 'Proof', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-sans uppercase tracking-widest text-white/70">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone">
              {winners?.map((w, i) => (
                <tr key={w.id} className={`hover:bg-gold-pale transition-colors ${i % 2 === 1 ? 'bg-off-white' : ''}`}>
                  <td className="px-4 py-3.5">
                    <p className="font-sans text-sm font-medium text-ink">{w.user?.name}</p>
                    <p className="font-sans text-xs text-slate">{w.user?.email}</p>
                  </td>
                  <td className="px-4 py-3.5 font-sans text-sm text-slate">
                    {w.draw ? formatMonth(w.draw.month) : formatDate(w.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 font-sans text-xs text-ink">{MATCH_LABELS[w.matchType]}</td>
                  <td className="px-4 py-3.5 font-mono text-sm text-gold font-medium">{formatCurrency(w.prizeAmount)}</td>
                  <td className="px-4 py-3.5">
                    {w.proofUrl ? (
                      <a href={w.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-forest underline font-sans">
                        View Proof
                      </a>
                    ) : (
                      <span className="text-xs text-slate font-sans">Not uploaded</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5"><PaymentStatusBadge status={w.status} /></td>
                  <td className="px-4 py-3.5">
                    {w.status === 'PENDING' && w.proofUrl && (
                      <Button
                        size="sm"
                        onClick={() => payout.mutate(w.id)}
                        isLoading={payout.isPending}
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Pay
                      </Button>
                    )}
                    {w.status === 'PAID' && (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-sans">
                        <CheckCircle className="w-4 h-4" /> Paid
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {winners?.length === 0 && (
            <div className="text-center py-12 text-slate font-sans">No winners yet.</div>
          )}
        </div>
      )}
    </div>
  )
}
