'use client'

import { IconCheck } from '@tabler/icons-react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/cn'

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      className={cn(
        'peer focus-ring size-4 shrink-0 rounded-[4px] border border-fg/30 shadow-xs outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-rose-500 aria-invalid:ring-rose-500/30 data-checked:border-ac data-checked:bg-ac data-checked:text-bg',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot='checkbox-indicator'
        className='grid place-content-center text-current transition-none'
      >
        <IconCheck className='size-3.5' />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
