// https://ui.shadcn.com/docs/components/tabs
'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '../../lib/cn'

const tabsListVariants = cva(
  cn(
    'max-w-full overflow-x-auto overflow-y-hidden',
    'flex items-center text-fg/60',
    'snap-x snap-mandatory scroll-p-1 scroll-smooth',
    // Hide scrollbar but keep functionality
    '[&::-webkit-scrollbar]:h-[0px]',
    '[&::-webkit-scrollbar-track]:bg-transparent',
    '[&::-webkit-scrollbar-thumb]:bg-transparent',
    '[&::-webkit-scrollbar-thumb]:rounded-full',
    'hover:[&::-webkit-scrollbar-thumb]:bg-transparent'
  ),
  {
    variants: {
      variant: {
        underline: 'rounded-none bg-transparent pb-0 shadow-fg/20 shadow-[inset_0_-2px_0_0]',
        segmented: 'bg-fg/5 rounded-full p-[3px]',
      },
    },
    defaultVariants: {
      variant: 'underline',
    },
  }
)

const tabsTriggerVariants = cva(
  cn(
    'focus-ring text-fg inline-flex items-center justify-center gap-1',
    'px-4 py-1 font-medium whitespace-nowrap',
    'disabled:pointer-events-none disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    'snap-end'
  ),
  {
    variants: {
      variant: {
        underline:
          'rounded-b-none border-b-[2px] border-transparent data-[state=active]:border-b-ac data-[state=active]:text-ac',
        segmented: 'rounded-full data-[state=active]:text-ac data-[state=active]:bg-bg',
      },
    },
    defaultVariants: {
      variant: 'underline',
    },
  }
)

const TabsContext = React.createContext<{ variant?: 'segmented' | 'underline' }>({})

export interface TabsProps
  extends React.ComponentProps<typeof TabsPrimitive.Root>,
    VariantProps<typeof tabsListVariants> {}

function Tabs({ className, variant = 'underline', ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ variant: variant || 'underline' }}>
      <TabsPrimitive.Root data-slot='tabs' className={cn(className)} {...props} />
    </TabsContext.Provider>
  )
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  const { variant } = React.useContext(TabsContext)

  return (
    <TabsPrimitive.List data-slot='tabs-list' className={cn(tabsListVariants({ variant }), className)} {...props} />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { variant } = React.useContext(TabsContext)

  return (
    <TabsPrimitive.Trigger
      data-slot='tabs-trigger'
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content data-slot='tabs-content' className={cn('focus-ring rounded-md', className)} {...props} />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
