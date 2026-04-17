import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Pencil, Trash2, Calendar, Globe, Star, ExternalLink } from 'lucide-react'
import { useForm } from 'react-hook-form'
import api from '@/lib/axios'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'

export function AdminCharities() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [managingEvents, setManagingEvents] = useState<any>(null)
  const qc = useQueryClient()

  const { data: charities, isLoading } = useQuery<any[]>({
    queryKey: ['admin-charities'],
    queryFn: () => api.get('/admin/charities').then((r) => r.data),
  })

  const { register, handleSubmit, reset } = useForm<any>()
  const { register: registerEvent, handleSubmit: handleSubmitEvent, reset: resetEvent } = useForm<any>()

  const create = useMutation({
    mutationFn: (d: any) => api.post('/admin/charities', { ...d, imageUrls: [d.imageUrl].filter(Boolean) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-charities'] }); reset(); setShowForm(false) },
  })

  const update = useMutation({
    mutationFn: ({ id, data }: any) => api.patch(`/admin/charities/${id}`, { ...data, imageUrls: [data.imageUrl].filter(Boolean) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-charities'] }); reset(); setEditing(null) },
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/charities/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-charities'] }); setDeleting(null) },
  })

  const addEvent = useMutation({
    mutationFn: ({ id, data }: any) => api.post(`/admin/charities/${id}/events`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-charities'] }); resetEvent() },
  })

  const deleteEvent = useMutation({
    mutationFn: ({ id, eventId }: any) => api.delete(`/admin/charities/${id}/events/${eventId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-charities'] }) },
  })

  const CharityForm = ({ onSubmit, isLoading: formLoading }: any) => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Input label="Charity Name" {...register('name', { required: true })} placeholder="e.g. The Golf Foundation" />
        </div>
        <div className="col-span-2">
          <Input label="Description" {...register('description', { required: true })} placeholder="Brief overview of what they do" />
        </div>
        <div className="col-span-2">
          <Input label="Mission Statement" {...register('mission')} placeholder="Their core mission in one sentence" />
        </div>
        <div>
          <Input label="Category" {...register('category')} placeholder="Youth Sports, Environment…" />
        </div>
        <div>
          <Input label="Website URL" {...register('website')} type="url" placeholder="https://..." />
        </div>
        <div className="col-span-2">
          <Input label="Cover Image URL" {...register('imageUrl')} type="url" placeholder="https://images.unsplash.com/..." />
        </div>
        <div className="col-span-2 pt-1">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" {...register('isFeatured')} className="sr-only peer" />
              <div className="w-10 h-6 rounded-full bg-stone peer-checked:bg-forest transition-colors" />
              <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="font-sans text-sm text-forest font-medium flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-gold" /> Feature this charity on the homepage
            </span>
          </label>
        </div>
      </div>
      <Button type="submit" variant="primary" isLoading={formLoading} className="w-full justify-center mt-2">Save Charity</Button>
    </form>
  )

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl text-forest">Charities</h1>
          <p className="font-sans text-slate mt-1">
            {charities?.length ?? 0} registered &middot; {charities?.filter(c => c.isFeatured).length ?? 0} featured
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Add Charity
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : charities?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-forest/10 flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-forest/40" />
          </div>
          <p className="font-heading text-xl text-forest">No charities yet</p>
          <p className="font-sans text-sm text-slate mt-1">Click "Add Charity" to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities?.map((charity) => (
            <div key={charity.id} className="group bg-white rounded-[24px] border border-stone overflow-hidden shadow-card flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              {/* Image */}
              <div className="relative h-44 bg-gradient-to-br from-forest/20 to-forest/5 overflow-hidden">
                {charity.imageUrls?.[0] ? (
                  <img
                    src={charity.imageUrls[0]}
                    alt={charity.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Star className="w-12 h-12 text-forest/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-sans font-bold bg-white/90 text-forest px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {charity.category || 'General'}
                  </span>
                  {charity.isFeatured && (
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold bg-gold text-white px-2.5 py-1 rounded-full">
                      <Star className="w-2.5 h-2.5 fill-white" /> Featured
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="flex items-center gap-1 text-[10px] font-sans text-white/90">
                    <Calendar className="w-3 h-3" /> {charity.events?.length || 0} events
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-heading text-lg text-forest leading-tight">{charity.name}</h3>
                <p className="font-sans text-xs text-slate mt-1.5 line-clamp-2 leading-relaxed flex-1">{charity.description}</p>

                {charity.website && (
                  <a
                    href={charity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-sans text-forest/70 hover:text-forest transition-colors"
                  >
                    <Globe className="w-3 h-3" /> {charity.website.replace(/^https?:\/\//, '').slice(0, 32)}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}

                <div className="mt-4 pt-4 border-t border-stone space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setManagingEvents(charity)}
                    className="w-full justify-center"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Manage Events ({charity.events?.length || 0})
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => { setEditing(charity); reset({ ...charity, imageUrl: charity.imageUrls?.[0] }) }}
                      className="flex-1 justify-center"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleting(charity.id)} className="px-3">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); reset() }} title="Add New Charity">
        <CharityForm onSubmit={(d: any) => create.mutate(d)} isLoading={create.isPending} />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => { setEditing(null); reset() }} title={`Edit: ${editing?.name}`}>
        <CharityForm onSubmit={(d: any) => update.mutate({ id: editing!.id, data: d })} isLoading={update.isPending} />
      </Modal>

      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Remove Charity" size="sm">
        <div className="flex items-start gap-3 mb-6 p-4 bg-red-50 rounded-xl border border-red-100">
          <Trash2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="font-sans text-sm text-red-700">
            This will permanently remove this charity and unlink it from all users who had it selected as their giving target.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)} className="flex-1 justify-center">Cancel</Button>
          <Button variant="danger" onClick={() => deleting && remove.mutate(deleting)} isLoading={remove.isPending} className="flex-1 justify-center">Delete</Button>
        </div>
      </Modal>

      <Modal isOpen={!!managingEvents} onClose={() => setManagingEvents(null)} title={`Events — ${managingEvents?.name}`} size="lg">
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone p-5 bg-off-white">
            <h4 className="font-heading text-forest mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Event</h4>
            <form onSubmit={handleSubmitEvent((d: any) => addEvent.mutate({ id: managingEvents.id, data: d }))} className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Input label="Event Title" {...registerEvent('title', { required: true })} placeholder="e.g. Annual Charity Golf Day" />
              </div>
              <div>
                <Input label="Date" type="date" {...registerEvent('date', { required: true })} />
              </div>
              <div>
                <Input label="Location" {...registerEvent('location')} placeholder="e.g. Pebble Beach" />
              </div>
              <div className="col-span-2">
                <Button type="submit" variant="primary" isLoading={addEvent.isPending} className="w-full justify-center">Add Event</Button>
              </div>
            </form>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            <p className="text-xs uppercase tracking-widest font-sans text-slate mb-3">Existing Events</p>
            {charities?.find(c => c.id === managingEvents?.id)?.events?.map((e: any) => (
              <div key={e.id} className="border border-stone bg-white rounded-xl p-3.5 flex justify-between items-center hover:bg-gold-pale transition-colors">
                <div>
                  <p className="font-heading text-sm text-forest">{e.title}</p>
                  <p className="font-sans text-xs text-slate mt-0.5">{formatDate(e.date)}{e.location && ` · ${e.location}`}</p>
                </div>
                <button
                  onClick={() => deleteEvent.mutate({ id: managingEvents.id, eventId: e.id })}
                  className="p-1.5 text-slate hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={deleteEvent.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {!charities?.find(c => c.id === managingEvents?.id)?.events?.length && (
              <p className="text-sm font-sans text-slate text-center py-6">No events added yet.</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
