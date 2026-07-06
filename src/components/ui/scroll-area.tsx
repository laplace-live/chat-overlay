'use client'

import { ScrollArea as RadixScrollArea } from 'radix-ui'
// Migrated and modifed from Mantine v6 and shadcn ScrollArea component
// https://github.com/mantinedev/mantine/tree/v6/src/mantine-core/src/ScrollArea
// https://ui.shadcn.com/docs/components/scroll-area
import type React from 'react'
import type { ComponentProps } from 'react'

import { cn } from '@/lib/cn'

export interface ScrollAreaProps extends ComponentProps<typeof RadixScrollArea.Root> {
  /** Scrollbar size in pixels */
  scrollbarSize?: number

  /** Should scrollbars be hidden */
  hideScrollbar?: boolean

  /** Should scrollbars be offset with padding */
  offsetScrollbars?: boolean

  /** Get viewport ref */
  viewportRef?: React.ForwardedRef<React.ComponentRef<typeof RadixScrollArea.Viewport>>

  /** Props added to the viewport element */
  // viewportProps?: React.ComponentPropsWithRef<'div'>
  viewportProps?: React.ComponentPropsWithRef<typeof RadixScrollArea.Viewport>

  /** Subscribe to scroll position changes */
  onScrollPositionChange?(position: { x: number; y: number }): void
}

function ScrollArea({
  className,
  children,
  scrollbarSize = 8,
  hideScrollbar = false,
  offsetScrollbars = false,
  viewportRef,
  viewportProps,
  onScrollPositionChange,
  ...props
}: ScrollAreaProps) {
  const { className: viewportClassName, ...restViewportProps } = viewportProps || {}

  return (
    <RadixScrollArea.Root
      data-slot='scroll-area'
      className={cn('relative overflow-hidden', className)}
      style={{ '--scrollbar-size': `${scrollbarSize}px` } as React.CSSProperties}
      {...props}
    >
      <RadixScrollArea.Viewport
        ref={viewportRef}
        className={cn(
          'scroll-area size-full focus-visible:outline-ac/20',
          // https://github.com/radix-ui/primitives/issues/926
          '[&>div]:block!',
          offsetScrollbars && {
            'pr-(--scrollbar-size)': true,
            'pb-(--scrollbar-size)': true,
          },
          viewportClassName
        )}
        onScroll={
          typeof onScrollPositionChange === 'function'
            ? ({ currentTarget }) =>
                onScrollPositionChange({
                  x: currentTarget.scrollLeft,
                  y: currentTarget.scrollTop,
                })
            : undefined
        }
        {...restViewportProps}
      >
        {children}
      </RadixScrollArea.Viewport>

      {!hideScrollbar && <ScrollBar />}

      {/* scrollbar background is transparent by default, so no needs for this component */}
      <RadixScrollArea.Corner />
    </RadixScrollArea.Root>
  )
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof RadixScrollArea.ScrollAreaScrollbar>) {
  return (
    <RadixScrollArea.ScrollAreaScrollbar
      data-slot='scroll-area-scrollbar'
      orientation={orientation}
      className={cn(
        'flex touch-none select-none bg-fg/0 p-px transition-colors hover:bg-fg/5',
        orientation === 'vertical' && 'h-full w-(--scrollbar-size,8px) border-l border-l-transparent',
        orientation === 'horizontal' && 'h-(--scrollbar-size,8px) flex-col border-t border-t-transparent',
        className
      )}
      {...props}
    >
      <RadixScrollArea.ScrollAreaThumb
        data-slot='scroll-area-thumb'
        className={cn(
          'relative flex-1 rounded-full bg-fg/40 hover:bg-fg/80',
          'before:absolute before:top-1/2 before:left-1/2 before:size-full before:min-h-6 before:min-w-6 before:-translate-x-1/2 before:-translate-y-1/2'
        )}
      />
    </RadixScrollArea.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
