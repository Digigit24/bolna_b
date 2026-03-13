import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
          'transition-all duration-150 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'cursor-pointer',
          {
            'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800':
              variant === 'primary',
            'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300':
              variant === 'secondary',
            'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800':
              variant === 'destructive',
            'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200':
              variant === 'ghost',
            'border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 active:bg-slate-100':
              variant === 'outline',
          },
          {
            'h-8 px-3 text-xs rounded-md': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
export { Button }
