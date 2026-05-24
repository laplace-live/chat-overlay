import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/cn'

const inputVariants = cva(
  [
    'w-full appearance-none border border-fg/30 bg-transparent',
    'text-fg shadow-xs outline-hidden placeholder:text-fg/40',
    'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-sm',
    'focus-ring',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
    'aria-invalid:border-rose-500 aria-invalid:ring-rose-500/30',

    // Hide native spinner buttons
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
  ],
  {
    variants: {
      // Should match Button
      inputSize: {
        sm: 'h-6 rounded-sm px-1.5 text-xs',
        md: 'h-8 rounded-md px-2 text-sm',
        lg: 'h-10 rounded-md px-3 text-base',
      },
    },
    defaultVariants: {
      inputSize: 'md',
    },
  }
)

export interface InputProps extends React.ComponentProps<'input'>, VariantProps<typeof inputVariants> {}

function Input({ className, type, inputSize, ...props }: InputProps) {
  return <input type={type} data-slot='input' className={cn(inputVariants({ inputSize }), className)} {...props} />
}

export { Input }
