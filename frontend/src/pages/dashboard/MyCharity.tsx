import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { useCharities } from '@/hooks/useCharities'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Heart, Check, ExternalLink, Users, Calendar, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import api from '@/lib/axios'

export function MyCharity() {
  const { user, setUser } = useAuthStore()
  const [showChange, setShowChange] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [percent, setPercent] = useState(user?.charityPercent || 10)
  const [saving, setSaving] = useState(false)
  const [donating, setDonating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [donationError, setDonationError] = useState<string | null>(null)
  const { data: charities, isLoading } = useCharities()

  const currentCharity = charities?.find((c) => c.id === user?.charityId)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await api.patch(`/auth/me`, {
        charityId: selectedId || user?.charityId,
        charityPercent: percent,
      })
      // Refresh user
      const { data: me } = await api.get('/auth/me')
      setUser(me)
      setShowChange(false)
      setSelectedId('')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDonate = async () => {
    if (!currentCharity) return
    setDonating(true)
    setDonationError(null)
    try {
      const { data } = await api.post(`/charities/${currentCharity.id}/donate`)
      if (data?.url) window.location.href = data.url
    } catch (err: any) {
      setDonationError(err?.response?.data?.error || 'Failed to start donation. Please try again.')
      setDonating(false)
    }
  }

  const estimatedAnnualDonation = (user?.charityPercent || 10) * 12 * 9.99 * 0.01
  const yearlyPlan = user?.subscriptionPlan === 'YEARLY'

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-forest">My Charity</h1>
        <p className="font-sans text-slate mt-1">Your chosen charity receives 10% or more of your subscription every month.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : currentCharity ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-stone overflow-hidden shadow-card"
        >
          {/* Charity image */}
          <div className="h-48 overflow-hidden relative">
            <img src={currentCharity.imageUrls[0]} alt={currentCharity.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 card-overlay" />
            <div className="absolute bottom-0 left-0 p-5">
              <span className="inline-block px-2.5 py-1 rounded-full bg-charity text-white text-xs font-sans uppercase tracking-wider mb-2">
                {currentCharity.category}
              </span>
              <h2 className="font-heading text-2xl text-white">{currentCharity.name}</h2>
            </div>
          </div>

          <div className="p-6">
            {/* Mission */}
            <p className="font-sans text-slate leading-relaxed mb-6">{currentCharity.mission}</p>

            {/* Charity stats */}
            {currentCharity._count && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-lg bg-off-white border border-stone">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-forest" />
                    <p className="text-xs uppercase tracking-wider text-slate font-sans">Supporters</p>
                  </div>
                  <p className="font-mono text-lg font-semibold text-forest">{currentCharity._count.users}</p>
                </div>
                <div className="p-3 rounded-lg bg-gold-pale border border-gold/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-gold" />
                    <p className="text-xs uppercase tracking-wider text-slate font-sans">Your monthly</p>
                  </div>
                  <p className="font-mono text-lg font-semibold text-gold">{user?.charityPercent || 10}%</p>
                </div>
              </div>
            )}

            {/* Your contribution details */}
            <div className="p-4 rounded-xl bg-gold-pale border border-gold/20 mb-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-sans text-sm text-ink flex items-center gap-2">
                    <Heart className="w-4 h-4 text-gold fill-current" />
                    Your contribution
                  </p>
                  <span className="font-mono text-2xl font-semibold text-gold">{user?.charityPercent || 10}%</span>
                </div>
                <div className="h-2 rounded-full bg-stone overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-gold transition-all duration-300"
                    style={{ width: `${((user?.charityPercent || 10) / 100) * 100}%` }}
                  />
                </div>
              </div>

              {/* Estimated annual */}
              <div className="pt-3 border-t border-gold/30 text-sm">
                <p className="font-sans text-gold/80 mb-1">Estimated annual donation</p>
                <p className="font-mono font-semibold text-gold">£{estimatedAnnualDonation.toFixed(2)}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-4">
              <Button variant="secondary" onClick={() => { setShowChange(true); setError(null); setSelectedId('') }} className="flex-1 justify-center">
                Change Charity
              </Button>
              {currentCharity.website && (
                <a href={currentCharity.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="md" title="Visit charity website">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>

            {/* Upcoming events */}
            {currentCharity.events && currentCharity.events.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-off-white border border-stone">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-forest" />
                  <p className="font-heading text-sm text-forest">Upcoming Events</p>
                </div>
                <div className="space-y-2">
                  {currentCharity.events.slice(0, 3).map((event) => (
                    <div key={event.id} className="text-sm">
                      <p className="font-sans font-medium text-ink">{event.title}</p>
                      <p className="font-sans text-xs text-slate">
                        {new Date(event.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {event.location && ` · ${event.location}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extra donation CTA */}
            <div className="pt-4 border-t border-stone">
              <p className="font-heading text-lg text-forest mb-2">Want to give more?</p>
              <p className="font-sans text-sm text-slate mb-4">Make an independent one-off donation directly to {currentCharity.name}.</p>
              {donationError && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-sans">{donationError}</p>
                </div>
              )}
              <Button 
                onClick={handleDonate}
                isLoading={donating}
                className="w-full justify-center"
              >
                Make a £10.00 Donation
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-stone rounded-xl">
          <Heart className="w-12 h-12 text-stone mx-auto mb-3" />
          <p className="font-heading text-xl text-forest mb-2">No charity selected</p>
          <p className="font-sans text-slate text-sm mb-6">Choose a charity to receive your subscription contributions.</p>
          <Button onClick={() => setShowChange(true)}>Choose a Charity</Button>
        </div>
      )}

      {/* Change charity modal */}
      <Modal isOpen={showChange} onClose={() => { setShowChange(false); setSelectedId(''); setError(null) }} title="Change Charity" size="lg">
        {/* Error message */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-sans">{error}</p>
          </div>
        )}

        {/* Charity selection */}
        <div className="space-y-3 max-h-64 overflow-y-auto mb-5">
          {charities?.map((charity) => (
            <motion.button
              key={charity.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedId(charity.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                (selectedId || user?.charityId) === charity.id
                  ? 'border-gold bg-gold-pale shadow-md'
                  : 'border-stone bg-white hover:border-forest/30'
              }`}
            >
              {charity.imageUrls[0] && (
                <img src={charity.imageUrls[0]} alt={charity.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm text-forest">{charity.name}</p>
                <p className="font-sans text-xs text-slate truncate">{charity.category}</p>
              </div>
              {(selectedId || user?.charityId) === charity.id && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-gold flex items-center justify-center shrink-0"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Contribution slider */}
        <div className="mb-5 p-4 rounded-xl bg-off-white border border-stone">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs uppercase tracking-wider text-slate font-sans font-medium">Contribution %</label>
            <span className="font-mono text-lg font-semibold text-gold">{percent}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            className="w-full accent-gold"
          />
          <p className="text-xs text-slate font-sans mt-2 flex items-center justify-between">
            <span>Minimum 10% required</span>
            <span className="text-gold font-medium">Est. £{(percent * 12 * 9.99 * 0.01).toFixed(2)}/year</span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => { setShowChange(false); setSelectedId(''); setError(null) }} className="flex-1 justify-center" disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={saving} className="flex-1 justify-center">
            Save Changes
          </Button>
        </div>
      </Modal>
    </div>
  )
}
