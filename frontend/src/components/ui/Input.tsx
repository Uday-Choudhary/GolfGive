import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium uppercase tracking-widest text-slate font-sans"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3.5 rounded-md border border-stone bg-white font-sans text-base text-ink',
            'transition-all duration-150 outline-none',
            'placeholder:text-stone focus:border-forest focus:ring-2 focus:ring-forest/10',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-400/10',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 font-sans">{error}</p>}
        {hint && !error && <p className="text-xs text-slate font-sans">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
