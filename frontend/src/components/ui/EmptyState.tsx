import { type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 ring-1 ring-slate-200/50">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="mt-5 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-xs text-center text-sm text-slate-500">{description}</p>
      {action && (
        <Button size="sm" className="mt-5" onClick={action.onClick}>
          {action.icon} {action.label}
        </Button>
      )}
    </div>
  )
}
