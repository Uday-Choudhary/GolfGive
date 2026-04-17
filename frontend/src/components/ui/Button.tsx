import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className, children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-sans font-medium uppercase tracking-widest transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50'

    const variants = {
      primary:
        '!bg-[#FF7B6B] !text-white rounded-full shadow-card border border-coral/10 hover:!bg-[#FA6856] hover:-translate-y-0.5 active:scale-95',
      secondary:
        '!bg-white border-2 border-forest !text-forest rounded-full hover:!bg-forest hover:!text-white active:scale-95 hover:-translate-y-0.5',
      ghost:
        '!bg-transparent border border-stone !text-forest rounded-full hover:!bg-forest hover:border-forest hover:!text-white active:scale-95 hover:-translate-y-0.5',
      glass:
        '!bg-white/10 border border-white/25 !text-white rounded-full backdrop-blur-sm hover:!bg-white/20 hover:-translate-y-0.5 active:scale-95',
      danger:
        '!bg-red-500 !text-white rounded-full hover:!bg-red-600 hover:-translate-y-0.5 active:scale-95',
    }

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-xs',
      lg: 'px-8 py-4 text-sm',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
