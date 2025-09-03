import * as React from 'react'

import { cn } from '../../lib/cn'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'placeholder:text-fg/60 focus-ring flex min-h-12 w-full rounded-sm border bg-transparent px-2 py-1 text-base disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
