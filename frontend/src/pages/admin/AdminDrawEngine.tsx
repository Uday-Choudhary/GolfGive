import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Play, Shuffle, CheckCircle, AlertCircle, Dice5, BarChart2, Trophy, Users, Clock } from 'lucide-react'
import api from '@/lib/axios'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { formatCurrency, formatMonth } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  SIMULATED: 'bg-blue-50 text-blue-700 border-blue-200',
  PUBLISHED: 'bg-green-50 text-green-700 border-green-200',
}

export function AdminDrawEngine() {
  const [mode, setMode] = useState<'RANDOM' | 'ALGORITHMIC'>('RANDOM')
  const [simResult, setSimResult] = useState<any>(null)
  const [pendingDraw, setPendingDraw] = useState<any>(null)
  const [publishConfirm, setPublishConfirm] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: draws, isLoading } = useQuery({
    queryKey: ['admin-draws'],
    queryFn: () => api.get('/admin/draws').then((r) => r.data),
  })

  const simulate = useMutation({
    mutationFn: () => api.post('/admin/draws/simulate', { mode }),
    onSuccess: ({ data }) => setSimResult(data),
  })

  const createDraw = useMutation({
    mutationFn: () => api.post('/admin/draws', { mode }),
    onSuccess: ({ data }) => { setPendingDraw(data); qc.invalidateQueries({ queryKey: ['admin-draws'] }) },
  })

  const publishDraw = useMutation({
    mutationFn: (id: string) => api.post(`/admin/draws/${id}/publish`),
    onSuccess: () => { setPublishConfirm(null); qc.invalidateQueries({ queryKey: ['admin-draws'] }) },
  })

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-forest">Draw Engine</h1>
        <p className="font-sans text-slate mt-1">Configure, simulate, and publish monthly draws.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Config Panel */}
        <div className="bg-white rounded-[24px] border border-stone p-6 shadow-card flex flex-col gap-6">
          <div>
            <h3 className="font-heading text-xl text-forest mb-1">Draw Configuration</h3>
            <p className="font-sans text-xs text-slate">Choose a mode and run a simulation before committing to a live draw.</p>
          </div>

          {/* Mode toggle */}
          <div>
            <p className="text-xs uppercase tracking-wider text-slate font-sans mb-3 font-semibold">Draw Mode</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { key: 'RANDOM', label: 'Random', desc: 'Draws 5 numbers randomly from 1–45.', icon: Dice5 },
                { key: 'ALGORITHMIC', label: 'Algorithmic', desc: 'Weights by most frequent scores across active users.', icon: BarChart2 },
              ] as const).map(({ key, label, desc, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl border-2 text-left transition-all ${
                    mode === key
                      ? 'border-forest bg-forest/5 shadow-md'
                      : 'border-stone hover:border-forest/40 hover:bg-off-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${mode === key ? 'bg-forest text-white' : 'bg-stone text-slate'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className={`font-sans font-bold text-sm ${mode === key ? 'text-forest' : 'text-slate'}`}>{label}</p>
                  <p className="font-sans text-xs text-slate leading-relaxed">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" onClick={() => simulate.mutate()} isLoading={simulate.isPending} className="justify-center">
              <Play className="w-4 h-4" /> Simulate
            </Button>
            <Button variant="primary" onClick={() => createDraw.mutate()} isLoading={createDraw.isPending} className="justify-center">
              <Shuffle className="w-4 h-4" /> Create Draw
            </Button>
          </div>

          {/* Simulation result */}
          {simResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-forest text-white"
            >
              <p className="text-xs uppercase tracking-widest font-sans text-white/60 mb-3">Simulation Preview</p>
              <div className="flex gap-2 mb-4">
                {simResult.drawNumbers.map((n: number) => (
                  <div
                    key={n}
                    className="w-11 h-11 rounded-full border-2 border-gold/40 bg-white/10 flex items-center justify-center"
                  >
                    <span className="font-mono text-sm font-bold text-gold">{n}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'jackpot', label: 'Jackpot', icon: Trophy },
                  { key: 'fourMatch', label: '4-Match', icon: Users },
                  { key: 'threeMatch', label: '3-Match', icon: Users },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="text-center p-3 rounded-xl bg-white/10 border border-white/10">
                    <Icon className="w-3.5 h-3.5 text-gold mx-auto mb-1" />
                    <p className="font-mono text-sm font-bold text-white">{formatCurrency(simResult.pools?.[key] || 0)}</p>
                    <p className="text-[10px] text-white/60 font-sans uppercase tracking-wider">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/60 font-sans mt-3">{simResult.matchResults.length} potential winner(s)</p>
            </motion.div>
          )}

          {pendingDraw && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl bg-gold-pale border border-gold/30 text-center">
              <p className="font-sans text-sm text-gold font-semibold">Draw created for {formatMonth(pendingDraw.month)}</p>
              <p className="font-sans text-xs text-slate mt-1">Go to All Draws to simulate and publish it.</p>
            </motion.div>
          )}
        </div>

        {/* Draws list */}
        <div className="bg-white rounded-[24px] border border-stone p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading text-xl text-forest">All Draws</h3>
            <span className="text-xs font-sans text-slate">{draws?.length || 0} total</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : draws?.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-forest/10 flex items-center justify-center mb-3">
                <Shuffle className="w-7 h-7 text-forest/30" />
              </div>
              <p className="font-heading text-forest">No draws yet</p>
              <p className="font-sans text-xs text-slate mt-1">Create your first draw using the panel on the left.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {draws?.map((draw: any, i: number) => (
                <motion.div
                  key={draw.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between p-4 rounded-2xl border border-stone hover:bg-off-white transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-forest" />
                    </div>
                    <div>
                      <p className="font-heading text-sm text-forest">{formatMonth(draw.month)}</p>
                      <p className="font-sans text-xs text-slate mt-0.5">{draw._count?.winners ?? 0} winners · {draw.drawMode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border font-sans ${STATUS_STYLES[draw.status] || ''}`}>
                      {draw.status}
                    </span>
                    {draw.status === 'SIMULATED' && (
                      <Button size="sm" variant="primary" onClick={() => setPublishConfirm(draw.id)}>
                        <CheckCircle className="w-3.5 h-3.5" /> Publish
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm publish modal */}
      <Modal isOpen={!!publishConfirm} onClose={() => setPublishConfirm(null)} title="Publish Draw" size="sm">
        <div className="flex items-start gap-3 mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-amber-800">
            Publishing this draw will identify all winners, send email notifications, and mark the draw as live. <strong>This action cannot be undone.</strong>
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setPublishConfirm(null)} className="flex-1 justify-center">Cancel</Button>
          <Button
            variant="primary"
            onClick={() => publishConfirm && publishDraw.mutate(publishConfirm)}
            isLoading={publishDraw.isPending}
            className="flex-1 justify-center"
          >
            Confirm & Publish
          </Button>
        </div>
      </Modal>
    </div>
  )
}
