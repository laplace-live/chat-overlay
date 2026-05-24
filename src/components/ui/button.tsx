'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/cn'

import { Spinner } from './spinner'

const buttonVariantsConfig = {
  // Should match Input, Toggle
  size: {
    sm: 'text-xs rounded-sm h-6 px-1.5 [&>svg]:size-3',
    default: 'text-sm rounded-md h-8 px-2.5 [&>svg]:size-4 [&>svg]:-mx-0.5',
    lg: 'text-base rounded-md gap-2 h-10 px-3.5 [&>svg]:size-5 [&>svg]:-mx-1',
    'icon-sm': 'rounded-sm size-6 [&>svg]:size-4',
    icon: 'rounded-md size-8 [&>svg]:size-5',
    'icon-lg': 'rounded-md size-10 [&>svg]:size-6',
  },
  variant: {
    // map to "secondary" in shadcn
    default: 'border-current/5',
    // map to "primary" in shadcn
    solid: 'shadow-md ',
    outline: 'bg-transparent shadow-xs not-disabled:hover:bg-current/10',
    ghost: 'border-transparent text-fg bg-transparent not-disabled:hover:bg-current/10',
    link: 'border-transparent underline-offset-2 hover:underline',
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
  'focus-ring inline-flex appearance-none items-center justify-center gap-1 whitespace-nowrap border font-medium focus-visible:border-current disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: buttonVariantsConfig,
    // prettier-ignore
    // biome-ignore format: keep long lines for readability
    compoundVariants: [
      { variant: 'default', tint: 'default', className: 'bg-fg/5 not-disabled:hover:bg-fg/10 focus-visible:border-ac focus-visible:ring-ac/30' },
      { variant: 'default', tint: 'accent', className: 'bg-ac/10 not-disabled:hover:bg-ac/20' },
      { variant: 'default', tint: 'gray', className: 'bg-gray-500/10 not-disabled:hover:bg-gray-500/20', },
      { variant: 'default', tint: 'red', className: 'bg-red-500/10 not-disabled:hover:bg-red-500/20', },
      { variant: 'default', tint: 'orange', className: 'bg-orange-500/10 not-disabled:hover:bg-orange-500/20', },
      { variant: 'default', tint: 'amber', className: 'bg-amber-500/10 not-disabled:hover:bg-amber-500/20', },
      { variant: 'default', tint: 'yellow', className: 'bg-yellow-500/10 not-disabled:hover:bg-yellow-500/20', },
      { variant: 'default', tint: 'lime', className: 'bg-lime-500/10 not-disabled:hover:bg-lime-500/20', },
      { variant: 'default', tint: 'green', className: 'bg-green-500/10 not-disabled:hover:bg-green-500/20', },
      { variant: 'default', tint: 'emerald', className: 'bg-emerald-500/10 not-disabled:hover:bg-emerald-500/20', },
      { variant: 'default', tint: 'teal', className: 'bg-teal-500/10 not-disabled:hover:bg-teal-500/20', },
      { variant: 'default', tint: 'cyan', className: 'bg-cyan-500/10 not-disabled:hover:bg-cyan-500/20', },
      { variant: 'default', tint: 'sky', className: 'bg-sky-500/10 not-disabled:hover:bg-sky-500/20', },
      { variant: 'default', tint: 'blue', className: 'bg-blue-500/10 not-disabled:hover:bg-blue-500/20', },
      { variant: 'default', tint: 'indigo', className: 'bg-indigo-500/10 not-disabled:hover:bg-indigo-500/20', },
      { variant: 'default', tint: 'violet', className: 'bg-violet-500/10 not-disabled:hover:bg-violet-500/20', },
      { variant: 'default', tint: 'purple', className: 'bg-purple-500/10 not-disabled:hover:bg-purple-500/20', },
      { variant: 'default', tint: 'fuchsia', className: 'bg-fuchsia-500/10 not-disabled:hover:bg-fuchsia-500/20', },
      { variant: 'default', tint: 'pink', className: 'bg-pink-500/10 not-disabled:hover:bg-pink-500/20', },
      { variant: 'default', tint: 'rose', className: 'bg-rose-500/10 not-disabled:hover:bg-rose-500/20', },
      { variant: 'default', tint: 'white', className: 'bg-white/10 not-disabled:hover:bg-white/20' },
      { variant: 'default', tint: 'black', className: 'bg-black/10 not-disabled:hover:bg-black/20' },

      // Solid
      { variant: 'solid', tint: 'default', className: 'border-fg bg-fg/95 text-bg shadow-fg/20 not-disabled:hover:bg-fg/80' },
      { variant: 'solid', tint: 'accent', className: 'border-ac bg-ac/95 text-bg shadow-ac/25 not-disabled:hover:bg-ac/80' },
      { variant: 'solid', tint: 'gray', className: 'border-gray-500 bg-gray-500/95 text-bg shadow-gray-500/25 not-disabled:hover:bg-gray-400', },
      { variant: 'solid', tint: 'red', className: 'border-red-500 bg-red-500/95 text-bg shadow-red-500/25 not-disabled:hover:bg-red-400' },
      { variant: 'solid', tint: 'orange', className: 'border-orange-500 bg-orange-500/95 text-bg shadow-orange-500/25 not-disabled:hover:bg-orange-400', },
      { variant: 'solid', tint: 'amber', className: 'border-amber-500 bg-amber-500/95 text-bg shadow-amber-500/25 not-disabled:hover:bg-amber-400', },
      { variant: 'solid', tint: 'yellow', className: 'border-yellow-500 bg-yellow-500/95 text-bg shadow-yellow-500/25 not-disabled:hover:bg-yellow-400', },
      { variant: 'solid', tint: 'lime', className: 'border-lime-500 bg-lime-500/95 text-bg shadow-lime-500/25 not-disabled:hover:bg-lime-400', },
      { variant: 'solid', tint: 'green', className: 'border-green-500 bg-green-500/95 text-bg shadow-green-500/25 not-disabled:hover:bg-green-400', },
      { variant: 'solid', tint: 'emerald', className: 'border-emerald-500 bg-emerald-500/95 text-bg shadow-emerald-500/25 not-disabled:hover:bg-emerald-400', },
      { variant: 'solid', tint: 'teal', className: 'border-teal-500 bg-teal-500/95 text-bg shadow-teal-500/25 not-disabled:hover:bg-teal-400', },
      { variant: 'solid', tint: 'cyan', className: 'border-cyan-500 bg-cyan-500/95 text-bg shadow-cyan-500/25 not-disabled:hover:bg-cyan-400', },
      { variant: 'solid', tint: 'sky', className: 'border-sky-500 bg-sky-500/95 text-bg shadow-sky-500/25 not-disabled:hover:bg-sky-400' },
      { variant: 'solid', tint: 'blue', className: 'border-blue-500 bg-blue-500/95 text-bg shadow-blue-500/25 not-disabled:hover:bg-blue-400', },
      { variant: 'solid', tint: 'indigo', className: 'border-indigo-500 bg-indigo-500/95 text-bg shadow-indigo-500/25 not-disabled:hover:bg-indigo-400', },
      { variant: 'solid', tint: 'violet', className: 'border-violet-500 bg-violet-500/95 text-bg shadow-violet-500/25 not-disabled:hover:bg-violet-400', },
      { variant: 'solid', tint: 'purple', className: 'border-purple-500 bg-purple-500/95 text-bg shadow-purple-500/25 not-disabled:hover:bg-purple-400', },
      { variant: 'solid', tint: 'fuchsia', className: 'border-fuchsia-500 bg-fuchsia-500/95 text-bg shadow-fuchsia-500/25 not-disabled:hover:bg-fuchsia-400', },
      { variant: 'solid', tint: 'pink', className: 'border-pink-500 bg-pink-500/95 text-bg shadow-pink-500/25 not-disabled:hover:bg-pink-400', },
      { variant: 'solid', tint: 'rose', className: 'border-rose-500 bg-rose-500/95 text-bg shadow-rose-500/25 not-disabled:hover:bg-rose-400', },
      { variant: 'solid', tint: 'white', className: 'border-white bg-white/95 text-black shadow-white/25 not-disabled:hover:bg-white/80' },
      { variant: 'solid', tint: 'black', className: 'border-black bg-black/95 text-white shadow-black/25 not-disabled:hover:bg-black/80' },

      // Outline
      { variant: 'outline', tint: 'default', className: 'border-fg/30 not-disabled:hover:bg-fg/5 focus-visible:border-ac focus-visible:ring-ac/30 data-open:bg-fg/5', },

      // Ghost
      { variant: 'ghost', tint: 'default', className: 'not-disabled:hover:bg-ac/10 not-disabled:hover:text-ac focus-visible:border-ac focus-visible:ring-ac/30 data-open:bg-ac/10 data-open:text-ac' },

      // Link
      { variant: 'link', tint: 'default', className: 'not-disabled:hover:text-ac focus-visible:border-ac focus-visible:ring-ac/30 data-open:text-ac' },

      // Dot variant padding adjustments
      // { variant: 'dot', size: 'default', className: 'pl-4.5' },
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
  /** @deprecated use children directly instead */
  leftSection?: React.ReactNode
  /** @deprecated use children directly instead */
  leftSectionClassName?: string
  /** @deprecated use children directly instead */
  rightSection?: React.ReactNode
  /** @deprecated use children directly instead */
  rightSectionClassName?: string
}

function Button({
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
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({ variant, size, tint, className }), loading && 'cursor-wait')}
      {...props}
    >
      {leftSection ? (
        <div className={cn('flex items-center justify-center', leftSectionClassName)}>{leftSection}</div>
      ) : null}

      <Slot.Slottable>{children}</Slot.Slottable>

      {loading && <Spinner />}
      {rightSection ? (
        <div className={cn('flex items-center justify-center', rightSectionClassName)}>{rightSection}</div>
      ) : null}
    </Comp>
  )
}

export { Button, buttonVariants, buttonVariantsConfig }
