import { cn } from '../../lib/utils'
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-xl border px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-kala-muted',
          'focus:outline-none focus:ring-2 focus:ring-kala-amber focus:border-kala-amber',
          'transition-colors duration-150',
          error ? 'border-red-400 bg-red-50' : 'border-stone-200 bg-white hover:border-stone-300',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-kala-muted">{hint}</p>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full rounded-xl border px-3.5 py-2.5 text-sm text-stone-800 placeholder:text-kala-muted resize-none',
          'focus:outline-none focus:ring-2 focus:ring-kala-amber focus:border-kala-amber',
          'transition-colors duration-150',
          error ? 'border-red-400 bg-red-50' : 'border-stone-200 bg-white hover:border-stone-300',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
