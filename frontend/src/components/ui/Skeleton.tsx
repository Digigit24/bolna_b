import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-6 space-y-4">
      <div className="skeleton h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-14 w-full" style={{ opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  )
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="skeleton h-4 w-20 mb-3" />
          <div className="skeleton h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-6 fade-in">
      <div className="skeleton h-20 w-full" />
      <CardsSkeleton />
      <div className="skeleton h-64 w-full" />
    </div>
  )
}
