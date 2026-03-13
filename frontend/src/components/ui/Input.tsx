import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900',
          'placeholder:text-slate-400',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
export { Input }
