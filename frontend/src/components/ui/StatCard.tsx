import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  trend?: string
  className?: string
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {trend && (
            <p className="text-xs font-medium text-emerald-600">{trend}</p>
          )}
        </div>
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
