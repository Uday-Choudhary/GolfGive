import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Check, X, Star } from 'lucide-react'
import { useScores, useAddScore, useUpdateScore, useDeleteScore } from '@/hooks/useScores'
import { scoreSchema, ScoreFormData, Score } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/lib/utils'

function ScoreSlot({ score, onEdit, onDelete }: { score?: Score; onEdit?: () => void; onDelete?: () => void }) {
  return (
    <div className={`relative flex flex-col items-center p-5 rounded-xl border-2 transition-all ${
      score ? 'border-forest bg-forest text-white' : 'border-dashed border-stone bg-off-white'
    }`}>
      {score ? (
        <>
          <span className="font-mono text-4xl font-semibold text-gold">{score.score}</span>
          <span className="font-sans text-xs text-white/60 mt-1 uppercase tracking-wider">pts</span>
          <span className="font-sans text-xs text-white/50 mt-2">{formatDate(score.date)}</span>
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={onEdit}
              className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              aria-label="Edit score"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={onDelete}
              className="w-6 h-6 rounded-md bg-white/10 hover:bg-red-500/30 flex items-center justify-center text-white/60 hover:text-red-300 transition-colors"
              aria-label="Delete score"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </>
      ) : (
        <>
          <span className="font-mono text-3xl text-stone">—</span>
          <span className="font-sans text-xs text-slate mt-2 uppercase tracking-wider">Empty</span>
        </>
      )}
    </div>
  )
}

export function MyScores() {
  const { data: scores, isLoading } = useScores()
  const addScore = useAddScore()
  const updateScore = useUpdateScore()
  const deleteScore = useDeleteScore()
  const [showAdd, setShowAdd] = useState(false)
  const [editingScore, setEditingScore] = useState<Score | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ScoreFormData>({
    resolver: zodResolver(scoreSchema),
  })

  const onAdd = (data: ScoreFormData) => {
    addScore.mutate(data, {
      onSuccess: () => { reset(); setShowAdd(false) },
    })
  }

  const onUpdate = (data: ScoreFormData) => {
    if (!editingScore) return
    updateScore.mutate({ id: editingScore.id, data }, {
      onSuccess: () => { reset(); setEditingScore(null) },
    })
  }

  const onDelete = (id: string) => {
    deleteScore.mutate(id, { onSuccess: () => setDeletingId(null) })
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl text-forest">My Scores</h1>
          <p className="font-sans text-slate mt-1">Up to 5 Stableford scores (1–45). Newest replaces oldest.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="shrink-0">
          <Plus className="w-4 h-4" /> Add Score
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* 5-slot display */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <ScoreSlot
                key={i}
                score={scores?.[i]}
                onEdit={() => { setEditingScore(scores![i]); reset({ score: scores![i].score, date: scores![i].date.split('T')[0] }) }}
                onDelete={() => setDeletingId(scores![i].id)}
              />
            ))}
          </div>

          {/* Score table */}
          {scores && scores.length > 0 && (
            <div className="bg-white rounded-xl border border-stone overflow-hidden">
              <div className="px-5 py-4 border-b border-stone flex items-center justify-between">
                <h3 className="font-heading text-lg text-forest">Score History</h3>
                <span className="text-xs text-slate font-sans">{scores.length}/5 slots used</span>
              </div>
              <div className="divide-y divide-stone">
                <AnimatePresence>
                  {scores.map((score, i) => (
                    <motion.div
                      key={score.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between px-5 py-4 hover:bg-off-white transition-colors"
                    >
                      <div>
                        <span className="font-mono text-xl font-medium text-forest">{score.score}</span>
                        <span className="text-slate text-xs font-sans ml-1">pts</span>
                      </div>
                      <span className="font-sans text-sm text-slate">{formatDate(score.date)}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingScore(score); reset({ score: score.score, date: score.date.split('T')[0] }) }}
                          className="p-1.5 rounded-lg hover:bg-stone transition-colors text-slate hover:text-forest"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(score.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-slate hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {scores?.length === 0 && (
            <div className="text-center py-16 text-slate font-sans">
              <Star className="w-12 h-12 text-stone mx-auto mb-4" />
              <p className="font-heading text-xl text-forest mb-2">No scores yet</p>
              <p>Add your first Stableford score to enter the monthly draw.</p>
            </div>
          )}
        </>
      )}

      {/* Add score modal */}
      <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); reset() }} title="Add Score">
        <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
          <Input
            label="Stableford Score (1–45)"
            type="number"
            min={1}
            max={45}
            placeholder="e.g. 32"
            {...register('score', { valueAsNumber: true })}
            error={errors.score?.message}
          />
          <Input
            label="Date Played"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            {...register('date')}
            error={errors.date?.message}
          />
          {addScore.isError && (
            <p className="text-sm text-red-500">{(addScore.error as any)?.response?.data?.error}</p>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => { setShowAdd(false); reset() }} className="flex-1 justify-center">
              Cancel
            </Button>
            <Button type="submit" isLoading={addScore.isPending} className="flex-1 justify-center">
              <Check className="w-4 h-4" /> Add Score
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit score modal */}
      <Modal isOpen={!!editingScore} onClose={() => { setEditingScore(null); reset() }} title="Edit Score">
        <form onSubmit={handleSubmit(onUpdate)} className="space-y-4">
          <Input
            label="Stableford Score (1–45)"
            type="number"
            min={1}
            max={45}
            {...register('score', { valueAsNumber: true })}
            error={errors.score?.message}
          />
          <Input
            label="Date Played"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            {...register('date')}
            error={errors.date?.message}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => { setEditingScore(null); reset() }} className="flex-1 justify-center">
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button type="submit" isLoading={updateScore.isPending} className="flex-1 justify-center">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm modal */}
      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Score" size="sm">
        <p className="font-sans text-slate mb-6">Are you sure you want to delete this score? This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeletingId(null)} className="flex-1 justify-center">
            Cancel
          </Button>
          <Button variant="danger" onClick={() => deletingId && onDelete(deletingId)} isLoading={deleteScore.isPending} className="flex-1 justify-center">
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
