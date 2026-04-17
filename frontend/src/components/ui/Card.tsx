import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'forest' | 'gold' | 'charity'
  hover?: boolean
}

export function Card({ variant = 'default', hover = true, className, children, ...props }: CardProps) {
  const base = 'rounded-xl transition-all duration-200'
  const variants = {
    default: 'bg-white border border-stone shadow-card',
    forest: 'bg-gradient-hero text-white',
    gold: 'bg-gradient-gold text-white',
    charity: 'bg-white border-l-4 border-l-charity border border-stone shadow-card',
  }
  const hoverClass = hover ? 'hover:-translate-y-1 hover:shadow-lg cursor-pointer' : ''

  return (
    <div className={cn(base, variants[variant], hoverClass, className)} {...props}>
      {children}
    </div>
  )
}
