import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AccordionItem {
  question: string
  answer: string
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-stone">
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="w-full flex items-center justify-between py-5 text-left gap-4 group"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="font-sans font-semibold text-base text-forest group-hover:text-forest-mid transition-colors uppercase tracking-tight">
              {item.question}
            </span>
            <div
              className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                open === i
                  ? 'border-forest bg-forest text-white'
                  : 'border-stone text-slate group-hover:border-gold group-hover:text-gold'
              }`}
            >
              {open === i ? (
                <Minus className="w-3.5 h-3.5" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
            </div>
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="pb-6 text-slate font-sans leading-relaxed">{item.answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
