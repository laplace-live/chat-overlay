'use client'

import { IconAsterisk } from '@tabler/icons-react'
import { Label as LabelPrimitive } from 'radix-ui'

import { cn } from '@/lib/cn'

function Label({
  className,
  required = false,
  children,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  required?: boolean
}) {
  return (
    <LabelPrimitive.Root
      data-slot='label'
      className={cn(
        'flex select-none items-center gap-2 whitespace-nowrap font-medium text-sm leading-none',

        // Disabled state
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-disabled:pointer-events-none group-data-disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden='true' className='pointer-events-none text-rose-500'>
          <IconAsterisk className='size-3' />
        </span>
      )}
    </LabelPrimitive.Root>
  )
}

export { Label }
