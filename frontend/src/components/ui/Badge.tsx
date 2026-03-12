import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'secondary'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-blue-100 text-blue-800': variant === 'default',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'destructive',
          'bg-gray-100 text-gray-800': variant === 'secondary',
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
      return 'success'
    case 'queued':
    case 'screening':
    case 'calling':
    case 'new':
      return 'warning'
    case 'failed':
    case 'rejected':
      return 'destructive'
    default:
      return 'secondary'
  }
}
