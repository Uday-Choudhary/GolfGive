import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Search, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '@/lib/axios'
import { Spinner } from '@/components/ui/Spinner'
import { SubStatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

export function AdminUsers() {
  const [search, setSearch] = useState('')
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const qc = useQueryClient()

  // Fetch all users for the table
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data),
  })

  // Fetch full details for the editing modal
  const { data: editingUser, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['admin-users', editingUserId],
    queryFn: () => api.get(`/admin/users/${editingUserId}`).then((r) => r.data),
    enabled: !!editingUserId,
  })

  const { register, handleSubmit, reset } = useForm<any>()

  const updateUser = useMutation({
    mutationFn: ({ id, data }: any) => api.patch(`/admin/users/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      alert('User updated successfully.')
      setEditingUserId(null)
    },
  })

  const deleteScore = useMutation({
    mutationFn: ({ userId, scoreId }: any) => api.delete(`/admin/users/${userId}/scores/${scoreId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users', editingUserId] })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const filtered = users?.filter(
    (u: any) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleEditClick = (id: string) => {
    setEditingUserId(id)
  }

  const onSubmitUpdate = (data: any) => {
    if (editingUserId) {
      updateUser.mutate({ id: editingUserId, data })
    }
  }

  // Pre-fill form when user details load
  if (editingUser && !updateUser.isPending) {
    // only reset once per load ideally, using simple default values in the form
  }

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-forest">Users</h1>
          <p className="font-sans text-slate mt-1">{users?.length ?? 0} registered users</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-lg border border-stone font-sans text-sm text-ink focus:outline-none focus:border-forest"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-stone overflow-hidden shadow-card">
          <table className="w-full">
            <thead>
              <tr className="bg-forest">
                {['Name', 'Email', 'Status', 'Plan', 'Charity %', 'Scores', 'Joined', ''].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-sans uppercase tracking-widest text-white/70">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone">
              {filtered?.map((u: any, i: number) => (
                <tr key={u.id} className={`transition-colors hover:bg-gold-pale ${i % 2 === 1 ? 'bg-off-white' : ''}`}>
                  <td className="px-4 py-3.5 font-sans text-sm text-ink font-medium">{u.name}</td>
                  <td className="px-4 py-3.5 font-sans text-sm text-slate">{u.email}</td>
                  <td className="px-4 py-3.5"><SubStatusBadge status={u.subscriptionStatus} /></td>
                  <td className="px-4 py-3.5 font-sans text-xs text-slate uppercase">{u.subscriptionPlan || '—'}</td>
                  <td className="px-4 py-3.5 font-mono text-sm text-gold">{u.charityPercent}%</td>
                  <td className="px-4 py-3.5 font-mono text-sm text-ink">{u._count.scores}</td>
                  <td className="px-4 py-3.5 font-sans text-xs text-slate">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => handleEditClick(u.id)}
                      className="text-slate hover:text-forest p-1 rounded-md transition-colors"
                      title="Edit User"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered?.length === 0 && (
            <div className="text-center py-12 text-slate font-sans">No users found.</div>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      <Modal isOpen={!!editingUserId} onClose={() => setEditingUserId(null)} title="Edit User" size="lg">
        {isLoadingDetails ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : editingUser ? (
          <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmitUpdate)} className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-forest mb-1 font-sans">Role</label>
                <select
                  defaultValue={editingUser.role}
                  {...register('role')}
                  className="w-full px-3 py-2 rounded-lg border border-stone bg-white text-ink text-sm font-sans focus:outline-none focus:border-forest"
                >
                  <option value="SUBSCRIBER">Subscriber</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-forest mb-1 font-sans">Subscription Status</label>
                <select
                  defaultValue={editingUser.subscriptionStatus}
                  {...register('subscriptionStatus')}
                  className="w-full px-3 py-2 rounded-lg border border-stone bg-white text-ink text-sm font-sans focus:outline-none focus:border-forest"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="LAPSED">Lapsed</option>
                </select>
              </div>

              <div className="col-span-2">
                <Button type="submit" isLoading={updateUser.isPending} className="w-full justify-center mt-2">
                  Save Changes
                </Button>
              </div>
            </form>

            <div className="pt-6 border-t border-stone">
              <h3 className="font-heading text-lg text-forest mb-3">User's Selected Scores</h3>
              {editingUser.scores && editingUser.scores.length > 0 ? (
                <div className="divide-y divide-stone border border-stone rounded-xl bg-off-white">
                  {editingUser.scores.map((score: any) => (
                    <div key={score.id} className="flex justify-between items-center px-4 py-3">
                      <div>
                        <span className="font-mono text-lg font-medium text-forest">{score.score} pts</span>
                        <span className="text-slate text-sm ml-3 font-sans">{formatDate(score.date)}</span>
                      </div>
                      <button
                        onClick={() => deleteScore.mutate({ userId: editingUser.id, scoreId: score.id })}
                        disabled={deleteScore.isPending}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Delete Score"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-sans text-slate">No scores logged yet.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-slate">User not found.</p>
        )}
      </Modal>
    </div>
  )
}
