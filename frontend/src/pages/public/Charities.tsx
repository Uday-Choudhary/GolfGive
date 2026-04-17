import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Calendar, Users } from 'lucide-react'
import { useCharities } from '@/hooks/useCharities'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/lib/utils'

const CATEGORIES = ['All', 'Youth Sports', 'Environment', 'Veterans', 'Health', 'Education', 'General']

export function Charities() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const { data: charities, isLoading } = useCharities({
    search: search || undefined,
    category: category !== 'All' ? category : undefined,
  })

  return (
    <div className="pt-24">
      {/* Header */}
      <section className="bg-gradient-hero py-20 px-6 text-center relative">
        <span className="text-xs uppercase tracking-widest text-gold font-sans font-medium">Giving</span>
        <h1 className="font-display text-5xl md:text-6xl text-white font-bold mt-2 mb-4">
          Charity Directory
        </h1>
        <p className="font-sans text-white/60 text-lg max-w-xl mx-auto mb-10">
          Every subscription supports a cause you believe in. Choose the charity that matters most to you.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate" />
          <input
            type="text"
            placeholder="Search charities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-full bg-white font-sans text-ink placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-gold/40 shadow-lg"
          />
        </div>
        <div className="wave-divider absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="h-12 w-full">
            <path fill="#F8F6F2" d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      <section className="bg-off-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-sans uppercase tracking-wider border transition-all ${
                  category === cat
                    ? 'bg-forest text-white border-forest'
                    : 'bg-white border-stone text-slate hover:border-forest hover:text-forest'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {charities?.map((charity, i) => (
                <motion.div
                  key={charity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl overflow-hidden shadow-card border border-stone hover:-translate-y-1 transition-transform"
                >
                  {/* Image */}
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={charity.imageUrls[0]}
                      alt={charity.name}
                      className="w-full h-full object-cover"
                    />
                    {charity.isFeatured && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gold text-white text-xs font-sans uppercase tracking-wider">
                        Featured
                      </span>
                    )}
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-forest text-xs font-sans">
                      {charity.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="font-heading text-xl text-forest mb-2">{charity.name}</h3>
                    <p className="font-sans text-slate text-sm leading-relaxed mb-4 line-clamp-3">
                      {charity.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-slate font-sans mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {charity._count?.users || 0} supporters
                      </span>
                    </div>

                    {/* Events */}
                    {charity.events && charity.events.length > 0 && (
                      <div className="border-t border-stone pt-4">
                        <p className="text-xs uppercase tracking-wider text-slate font-sans mb-2">Upcoming Events</p>
                        {charity.events.slice(0, 2).map((event) => (
                          <div key={event.id} className="flex items-start gap-2 mb-2">
                            <Calendar className="w-3.5 h-3.5 text-gold mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-ink">{event.title}</p>
                              <p className="text-xs text-slate">
                                {formatDate(event.date)}
                                {event.location && (
                                  <span className="flex items-center gap-0.5 mt-0.5">
                                    <MapPin className="w-3 h-3" />
                                    {event.location}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && charities?.length === 0 && (
            <div className="text-center py-20 text-slate font-sans">
              No charities found. Try adjusting your search.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
