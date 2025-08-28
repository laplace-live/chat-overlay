// https://ui.shadcn.com/docs/components/popover

'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import type * as React from 'react'

import { cn } from '../../lib/cn'

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverPortal = PopoverPrimitive.Portal

function PopoverContent({
  children,
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPortal>
      <PopoverPrimitive.Content
        data-slot='popover-content'
        align={align}
        sideOffset={sideOffset}
        collisionPadding={5}
        className={cn(
          'floating text-fg w-fit rounded-md p-3 text-base outline-hidden',
          'max-h-[var(--radix-popover-content-available-height)] overflow-y-auto',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          '[&>hr]:-mx-3 [&>hr]:my-2',
          // pointer-events-auto is necessary to make the popover content clickable due to a Radix UI bug.
          // See: https://github.com/radix-ui/primitives/issues/3142
          'pointer-events-auto',
          className
        )}
        // prevent auto focus on open
        onOpenAutoFocus={e => {
          e.preventDefault()
        }}
        {...props}
      >
        {children}
        {/* <PopoverPrimitive.Close /> */}
        {/* does not work with translucent background */}
        {/* <PopoverPrimitive.Arrow className='fill-bg' /> */}
      </PopoverPrimitive.Content>
    </PopoverPortal>
  )
}

export { Popover, PopoverTrigger, PopoverContent }
