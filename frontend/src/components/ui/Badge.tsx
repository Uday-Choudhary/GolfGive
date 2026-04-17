import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { SubscriptionStatus, PaymentStatus } from '@/types'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'charity' | 'default'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  const base = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium font-sans uppercase tracking-wider'
  const variants: Record<BadgeVariant, string> = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-700',
    charity: 'bg-purple-100 text-purple-700',
    default: 'bg-stone text-slate',
  }
  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {children}
    </span>
  )
}

// Convenience: map subscription status → badge
export function SubStatusBadge({ status }: { status?: SubscriptionStatus | null }) {
  const map: Record<SubscriptionStatus, { variant: BadgeVariant; label: string }> = {
    ACTIVE: { variant: 'success', label: 'Active' },
    INACTIVE: { variant: 'default', label: 'Inactive' },
    CANCELLED: { variant: 'danger', label: 'Cancelled' },
    LAPSED: { variant: 'warning', label: 'Lapsed' },
  }
  const currentStatus = status || 'INACTIVE'
  const { variant, label } = map[currentStatus]
  return (
    <Badge variant={variant}>
      <span className={`w-1.5 h-1.5 rounded-full ${variant === 'success' ? 'bg-green-500' : variant === 'warning' ? 'bg-amber-500' : variant === 'default' ? 'bg-slate' : 'bg-red-500'}`} />
      {label}
    </Badge>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant={status === 'PAID' ? 'success' : 'warning'}>
      {status === 'PAID' ? 'Paid' : 'Pending'}
    </Badge>
  )
}
