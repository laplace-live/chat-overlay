import type * as React from 'react'

import { cn } from '@/lib/cn'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(
        'focus-ring field-sizing-content flex min-h-12 w-full rounded-sm border border-fg/30 bg-transparent p-2 text-base shadow-xs placeholder:text-fg/40 md:text-sm',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-rose-500 aria-invalid:ring-rose-500/30',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
