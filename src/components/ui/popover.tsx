// https://ui.shadcn.com/docs/components/popover

'use client'

import { Popover as PopoverPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/cn'

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot='popover' {...props} />
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot='popover-trigger' {...props} />
}

function PopoverContent({
  children,
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot='popover-content'
        align={align}
        sideOffset={sideOffset}
        collisionPadding={5}
        className={cn(
          'floating w-fit rounded-md p-3 text-base text-fg outline-hidden',
          'max-h-(--radix-popover-content-available-height) overflow-y-auto',
          'max-w-(--radix-popover-content-available-width)',
          'data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-closed:animate-out',
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
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot='popover-anchor' {...props} />
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger }
