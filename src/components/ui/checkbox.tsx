'use client'

import { IconCheck } from '@tabler/icons-react'
import type * as React from 'react'

import { cn } from '../../lib/cn'

function Checkbox({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <div className='relative inline-flex [&+label]:pb-0'>
      <input
        type='checkbox'
        data-slot='checkbox'
        className={cn(
          'peer bg-bg/10 size-4 cursor-pointer appearance-none rounded-sm border',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'checked:border-ac checked:bg-ac',
          'focus-ring',
          className
        )}
        {...props}
      />
      <div className='text-bg pointer-events-none absolute flex size-4 items-center justify-center opacity-0 peer-checked:opacity-100'>
        <IconCheck className='size-3.5' />
      </div>
    </div>
  )
}

export { Checkbox }
