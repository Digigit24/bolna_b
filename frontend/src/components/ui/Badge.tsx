import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'secondary'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        {
          'bg-indigo-50 text-indigo-700 ring-indigo-600/20': variant === 'default',
          'bg-emerald-50 text-emerald-700 ring-emerald-600/20': variant === 'success',
          'bg-amber-50 text-amber-700 ring-amber-600/20': variant === 'warning',
          'bg-red-50 text-red-700 ring-red-600/20': variant === 'destructive',
          'bg-slate-50 text-slate-600 ring-slate-500/20': variant === 'secondary',
        },
        className,
      )}
      {...props}
    />
  )
}

/** Map candidate/call statuses to badge variants. */
export function statusVariant(
  status: string,
): 'success' | 'warning' | 'destructive' | 'default' | 'secondary' {
  switch (status) {
    case 'completed':
    case 'qualified':
    case 'hired':
    case 'open':
      return 'success'
    case 'queued':
    case 'screening':
    case 'calling':
    case 'new':
    case 'scheduled':
      return 'warning'
    case 'failed':
    case 'rejected':
    case 'canceled':
    case 'no_show':
      return 'destructive'
    case 'closed':
    case 'paused':
      return 'secondary'
    default:
      return 'default'
  }
}
