'use client'

import { Slot, Slottable } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'

import { cn } from '../../lib/cn'

import { Loading } from './loading'

const buttonVariantsConfig = {
  size: {
    sm: 'text-xs px-2 py-[calc(0.25rem-1px)] rounded-sm',
    default: 'text-base px-2.5 py-[calc(0.25rem-1px)]',
    lg: 'text-lg px-3 py-[calc(0.25rem-1px)]',
    icon: 'text-base p-[calc(0.25rem-1px)]',
  },
  variant: {
    default: 'border focus-visible:border-current',
    solid: 'border focus-visible:border-current',
    outline: 'border bg-transparent focus-visible:border-current',
    link: 'border border-transparent focus-visible:border-transparent text-fg not-disabled:hover:text-ac bg-transparent',
  },
  tint: {
    default: 'text-fg focus-visible:ring-fg/30',
    accent: 'text-ac focus-visible:ring-ac/30',
    gray: 'text-gray-500 focus-visible:ring-gray-500/30',
    red: 'text-red-500 focus-visible:ring-red-500/30',
    orange: 'text-orange-500 focus-visible:ring-orange-500/30',
    amber: 'text-amber-500 focus-visible:ring-amber-500/30',
    yellow: 'text-yellow-500 focus-visible:ring-yellow-500/30',
    lime: 'text-lime-500 focus-visible:ring-lime-500/30',
    green: 'text-green-500 focus-visible:ring-green-500/30',
    emerald: 'text-emerald-500 focus-visible:ring-emerald-500/30',
    teal: 'text-teal-500 focus-visible:ring-teal-500/30',
    cyan: 'text-cyan-500 focus-visible:ring-cyan-500/30',
    sky: 'text-sky-500 focus-visible:ring-sky-500/30',
    blue: 'text-blue-500 focus-visible:ring-blue-500/30',
    indigo: 'text-indigo-500 focus-visible:ring-indigo-500/30',
    violet: 'text-violet-500 focus-visible:ring-violet-500/30',
    purple: 'text-purple-500 focus-visible:ring-purple-500/30',
    fuchsia: 'text-fuchsia-500 focus-visible:ring-fuchsia-500/30',
    pink: 'text-pink-500 focus-visible:ring-pink-500/30',
    rose: 'text-rose-500 focus-visible:ring-rose-500/30',
    white: 'text-white focus-visible:ring-white/30',
    black: 'text-black focus-visible:ring-black/30',
  },
}

const buttonVariants = cva(
  'appearance-none inline-flex items-center gap-1 cursor-pointer justify-center whitespace-nowrap rounded-md font-medium focus-ring disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: buttonVariantsConfig,
    // prettier-ignore
    compoundVariants: [
      {
        variant: 'default',
        tint: 'default',
        className: 'border-fg/10 bg-fg/10 not-disabled:hover:bg-fg/20',
      },
      {
        variant: 'default',
        tint: 'accent',
        className: 'border-ac/10 bg-ac/10 not-disabled:hover:bg-ac/20',
      },
      {
        variant: 'default',
        tint: 'gray',
        className: 'border-gray-500/10 bg-gray-500/10 not-disabled:hover:bg-gray-500/20',
      },
      {
        variant: 'default',
        tint: 'red',
        className: 'border-red-500/10 bg-red-500/10 not-disabled:hover:bg-red-500/20',
      },
      {
        variant: 'default',
        tint: 'orange',
        className: 'border-orange-500/10 bg-orange-500/10 not-disabled:hover:bg-orange-500/20',
      },
      {
        variant: 'default',
        tint: 'amber',
        className: 'border-amber-500/10 bg-amber-500/10 not-disabled:hover:bg-amber-500/20',
      },
      {
        variant: 'default',
        tint: 'yellow',
        className: 'border-yellow-500/10 bg-yellow-500/10 not-disabled:hover:bg-yellow-500/20',
      },
      {
        variant: 'default',
        tint: 'lime',
        className: 'border-lime-500/10 bg-lime-500/10 not-disabled:hover:bg-lime-500/20',
      },
      {
        variant: 'default',
        tint: 'green',
        className: 'border-green-500/10 bg-green-500/10 not-disabled:hover:bg-green-500/20',
      },
      {
        variant: 'default',
        tint: 'emerald',
        className: 'border-emerald-500/10 bg-emerald-500/10 not-disabled:hover:bg-emerald-500/20',
      },
      {
        variant: 'default',
        tint: 'teal',
        className: 'border-teal-500/10 bg-teal-500/10 not-disabled:hover:bg-teal-500/20',
      },
      {
        variant: 'default',
        tint: 'cyan',
        className: 'border-cyan-500/10 bg-cyan-500/10 not-disabled:hover:bg-cyan-500/20',
      },
      {
        variant: 'default',
        tint: 'sky',
        className: 'border-sky-500/10 bg-sky-500/10 not-disabled:hover:bg-sky-500/20',
      },
      {
        variant: 'default',
        tint: 'blue',
        className: 'border-blue-500/10 bg-blue-500/10 not-disabled:hover:bg-blue-500/20',
      },
      {
        variant: 'default',
        tint: 'indigo',
        className: 'border-indigo-500/10 bg-indigo-500/10 not-disabled:hover:bg-indigo-500/20',
      },
      {
        variant: 'default',
        tint: 'violet',
        className: 'border-violet-500/10 bg-violet-500/10 not-disabled:hover:bg-violet-500/20',
      },
      {
        variant: 'default',
        tint: 'purple',
        className: 'border-purple-500/10 bg-purple-500/10 not-disabled:hover:bg-purple-500/20',
      },
      {
        variant: 'default',
        tint: 'fuchsia',
        className: 'border-fuchsia-500/10 bg-fuchsia-500/10 not-disabled:hover:bg-fuchsia-500/20',
      },
      {
        variant: 'default',
        tint: 'pink',
        className: 'border-pink-500/10 bg-pink-500/10 not-disabled:hover:bg-pink-500/20',
      },
      {
        variant: 'default',
        tint: 'rose',
        className: 'border-rose-500/10 bg-rose-500/10 not-disabled:hover:bg-rose-500/20',
      },
      {
        variant: 'default',
        tint: 'white',
        className: 'border-white/10 bg-white/10 not-disabled:hover:bg-white/20',
      },
      {
        variant: 'default',
        tint: 'black',
        className: 'border-black/10 bg-black/10 not-disabled:hover:bg-black/20',
      },

      // Solid
      {
        variant: 'solid',
        tint: 'default',
        className: 'bg-fg border-fg text-bg not-disabled:hover:bg-fg/80',
      },
      {
        variant: 'solid',
        tint: 'accent',
        className: 'bg-ac border-ac text-bg not-disabled:hover:bg-ac/80',
      },
      {
        variant: 'solid',
        tint: 'gray',
        className: 'bg-gray-500 border-gray-500 text-bg not-disabled:hover:bg-gray-400',
      },
      {
        variant: 'solid',
        tint: 'red',
        className: 'bg-red-500 border-red-500 text-bg not-disabled:hover:bg-red-400',
      },
      {
        variant: 'solid',
        tint: 'orange',
        className: 'bg-orange-500 border-orange-500 text-bg not-disabled:hover:bg-orange-400',
      },
      {
        variant: 'solid',
        tint: 'amber',
        className: 'bg-amber-500 border-amber-500 text-bg not-disabled:hover:bg-amber-400',
      },
      {
        variant: 'solid',
        tint: 'yellow',
        className: 'bg-yellow-500 border-yellow-500 text-bg not-disabled:hover:bg-yellow-400',
      },
      {
        variant: 'solid',
        tint: 'lime',
        className: 'bg-lime-500 border-lime-500 text-bg not-disabled:hover:bg-lime-400',
      },
      {
        variant: 'solid',
        tint: 'green',
        className: 'bg-green-500 border-green-500 text-bg not-disabled:hover:bg-green-400',
      },
      {
        variant: 'solid',
        tint: 'emerald',
        className: 'bg-emerald-500 border-emerald-500 text-bg not-disabled:hover:bg-emerald-400',
      },
      {
        variant: 'solid',
        tint: 'teal',
        className: 'bg-teal-500 border-teal-500 text-bg not-disabled:hover:bg-teal-400',
      },
      {
        variant: 'solid',
        tint: 'cyan',
        className: 'bg-cyan-500 border-cyan-500 text-bg not-disabled:hover:bg-cyan-400',
      },
      {
        variant: 'solid',
        tint: 'sky',
        className: 'bg-sky-500 border-sky-500 text-bg not-disabled:hover:bg-sky-400',
      },
      {
        variant: 'solid',
        tint: 'blue',
        className: 'bg-blue-500 border-blue-500 text-bg not-disabled:hover:bg-blue-400',
      },
      {
        variant: 'solid',
        tint: 'indigo',
        className: 'bg-indigo-500 border-indigo-500 text-bg not-disabled:hover:bg-indigo-400',
      },
      {
        variant: 'solid',
        tint: 'violet',
        className: 'bg-violet-500 border-violet-500 text-bg not-disabled:hover:bg-violet-400',
      },
      {
        variant: 'solid',
        tint: 'purple',
        className: 'bg-purple-500 border-purple-500 text-bg not-disabled:hover:bg-purple-400',
      },
      {
        variant: 'solid',
        tint: 'fuchsia',
        className: 'bg-fuchsia-500 border-fuchsia-500 text-bg not-disabled:hover:bg-fuchsia-400',
      },
      {
        variant: 'solid',
        tint: 'pink',
        className: 'bg-pink-500 border-pink-500 text-bg not-disabled:hover:bg-pink-400',
      },
      {
        variant: 'solid',
        tint: 'rose',
        className: 'bg-rose-500 border-rose-500 text-bg not-disabled:hover:bg-rose-400',
      },
      {
        variant: 'solid',
        tint: 'white',
        className: 'bg-white border-white text-black not-disabled:hover:bg-white/80',
      },
      {
        variant: 'solid',
        tint: 'black',
        className: 'bg-black border-black text-white not-disabled:hover:bg-black/80',
      },

      // Outline
      {
        variant: 'outline',
        tint: 'default',
        className:
          'border-fg/30 not-disabled:hover:text-fg/80 not-disabled:hover:border-fg/80 data-[state=open]:border-ac data-[state=open]:text-ac',
      },
      {
        variant: 'outline',
        tint: 'accent',
        className: 'border-ac not-disabled:hover:text-ac/80 not-disabled:hover:border-ac/80',
      },
      {
        variant: 'outline',
        tint: 'gray',
        className: 'border-gray-500 not-disabled:hover:text-gray-400 not-disabled:hover:border-gray-400',
      },
      {
        variant: 'outline',
        tint: 'red',
        className: 'border-red-500 not-disabled:hover:text-red-400 not-disabled:hover:border-red-400',
      },
      {
        variant: 'outline',
        tint: 'orange',
        className: 'border-orange-500 not-disabled:hover:text-orange-400 not-disabled:hover:border-orange-400',
      },
      {
        variant: 'outline',
        tint: 'amber',
        className: 'border-amber-500 not-disabled:hover:text-amber-400 not-disabled:hover:border-amber-400',
      },
      {
        variant: 'outline',
        tint: 'yellow',
        className: 'border-yellow-500 not-disabled:hover:text-yellow-400 not-disabled:hover:border-yellow-400',
      },
      {
        variant: 'outline',
        tint: 'lime',
        className: 'border-lime-500 not-disabled:hover:text-lime-400 not-disabled:hover:border-lime-400',
      },
      {
        variant: 'outline',
        tint: 'green',
        className: 'border-green-500 not-disabled:hover:text-green-400 not-disabled:hover:border-green-400',
      },
      {
        variant: 'outline',
        tint: 'emerald',
        className: 'border-emerald-500 not-disabled:hover:text-emerald-400 not-disabled:hover:border-emerald-400',
      },
      {
        variant: 'outline',
        tint: 'teal',
        className: 'border-teal-500 not-disabled:hover:text-teal-400 not-disabled:hover:border-teal-400',
      },
      {
        variant: 'outline',
        tint: 'cyan',
        className: 'border-cyan-500 not-disabled:hover:text-cyan-400 not-disabled:hover:border-cyan-400',
      },
      {
        variant: 'outline',
        tint: 'sky',
        className: 'border-sky-500 not-disabled:hover:text-sky-400 not-disabled:hover:border-sky-400',
      },
      {
        variant: 'outline',
        tint: 'blue',
        className: 'border-blue-500 not-disabled:hover:text-blue-400 not-disabled:hover:border-blue-400',
      },
      {
        variant: 'outline',
        tint: 'indigo',
        className: 'border-indigo-500 not-disabled:hover:text-indigo-400 not-disabled:hover:border-indigo-400',
      },
      {
        variant: 'outline',
        tint: 'violet',
        className: 'border-violet-500 not-disabled:hover:text-violet-400 not-disabled:hover:border-violet-400',
      },
      {
        variant: 'outline',
        tint: 'purple',
        className: 'border-purple-500 not-disabled:hover:text-purple-400 not-disabled:hover:border-purple-400',
      },
      {
        variant: 'outline',
        tint: 'fuchsia',
        className: 'border-fuchsia-500 not-disabled:hover:text-fuchsia-400 not-disabled:hover:border-fuchsia-400',
      },
      {
        variant: 'outline',
        tint: 'pink',
        className: 'border-pink-500 not-disabled:hover:text-pink-400 not-disabled:hover:border-pink-400',
      },
      {
        variant: 'outline',
        tint: 'rose',
        className: 'border-rose-500 not-disabled:hover:text-rose-400 not-disabled:hover:border-rose-400',
      },
      {
        variant: 'outline',
        tint: 'white',
        className: 'border-white not-disabled:hover:text-white/80 not-disabled:hover:border-white/80',
      },
      {
        variant: 'outline',
        tint: 'black',
        className: 'border-black not-disabled:hover:text-black/80 not-disabled:hover:border-black/80',
      },

      // Link
      {
        variant: 'link',
        tint: 'default',
        className: 'not-disabled:hover:text-ac data-[state=open]:text-ac',
      },
      {
        variant: 'link',
        tint: 'accent',
        className: 'not-disabled:hover:text-ac/80',
      },
      {
        variant: 'link',
        tint: 'gray',
        className: 'not-disabled:hover:text-gray-500',
      },
      {
        variant: 'link',
        tint: 'red',
        className: 'not-disabled:hover:text-red-500',
      },
      {
        variant: 'link',
        tint: 'orange',
        className: 'not-disabled:hover:text-orange-500',
      },
      {
        variant: 'link',
        tint: 'amber',
        className: 'not-disabled:hover:text-amber-500',
      },
      {
        variant: 'link',
        tint: 'yellow',
        className: 'not-disabled:hover:text-yellow-500',
      },
      {
        variant: 'link',
        tint: 'lime',
        className: 'not-disabled:hover:text-lime-500',
      },
      {
        variant: 'link',
        tint: 'green',
        className: 'not-disabled:hover:text-green-500',
      },
      {
        variant: 'link',
        tint: 'emerald',
        className: 'not-disabled:hover:text-emerald-500',
      },
      {
        variant: 'link',
        tint: 'teal',
        className: 'not-disabled:hover:text-teal-500',
      },
      {
        variant: 'link',
        tint: 'cyan',
        className: 'not-disabled:hover:text-cyan-500',
      },
      {
        variant: 'link',
        tint: 'sky',
        className: 'not-disabled:hover:text-sky-500',
      },
      {
        variant: 'link',
        tint: 'blue',
        className: 'not-disabled:hover:text-blue-500',
      },
      {
        variant: 'link',
        tint: 'indigo',
        className: 'not-disabled:hover:text-indigo-500',
      },
      {
        variant: 'link',
        tint: 'violet',
        className: 'not-disabled:hover:text-violet-500',
      },
      {
        variant: 'link',
        tint: 'purple',
        className: 'not-disabled:hover:text-purple-500',
      },
      {
        variant: 'link',
        tint: 'fuchsia',
        className: 'not-disabled:hover:text-fuchsia-500',
      },
      {
        variant: 'link',
        tint: 'pink',
        className: 'not-disabled:hover:text-pink-500',
      },
      {
        variant: 'link',
        tint: 'rose',
        className: 'not-disabled:hover:text-rose-500',
      },
      {
        variant: 'link',
        tint: 'white',
        className: 'not-disabled:hover:text-white/80',
      },
      {
        variant: 'link',
        tint: 'black',
        className: 'not-disabled:hover:text-black/80',
      },

      // Dot variant padding adjustments
      // { variant: 'dot', size: 'default', className: 'pl-[1.125rem]' },
      // { variant: 'dot', size: 'sm', className: 'pl-[0.85rem]' },
      // { variant: 'dot', size: 'lg', className: 'pl-5' },
    ],
    defaultVariants: {
      size: 'default',
      variant: 'default',
      tint: 'default',
    },
  }
)

export interface ButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  /**
   * @link https://www.radix-ui.com/primitives/docs/utilities/slot
   */
  asChild?: boolean
  loading?: boolean
  leftSection?: React.ReactNode
  leftSectionClassName?: string
  rightSection?: React.ReactNode
  rightSectionClassName?: string
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      tint,
      asChild = false,
      loading = false,
      leftSection,
      leftSectionClassName,
      rightSection,
      rightSectionClassName,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        data-slot='button'
        className={cn(buttonVariants({ variant, size, tint, className }), loading && 'cursor-wait')}
        ref={ref}
        {...props}
      >
        {leftSection ? (
          <div className={cn('flex items-center justify-center', leftSectionClassName)}>{leftSection}</div>
        ) : null}

        <Slottable>{children}</Slottable>

        {loading && <Loading />}
        {rightSection ? (
          <div className={cn('flex items-center justify-center', rightSectionClassName)}>{rightSection}</div>
        ) : null}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants, buttonVariantsConfig }
