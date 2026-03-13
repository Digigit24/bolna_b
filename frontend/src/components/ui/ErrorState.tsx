import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  compact?: boolean
}

export function ErrorState({
  title = 'Unable to load data',
  message = 'Please check your connection and try again.',
  onRetry,
  compact = false,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">{title}</p>
        {onRetry && (
          <button onClick={onRetry} className="ml-auto text-sm font-medium text-amber-700 hover:text-amber-900">
            Retry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <WifiOff className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-sm text-center text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" /> Try Again
        </Button>
      )}
    </div>
  )
}
