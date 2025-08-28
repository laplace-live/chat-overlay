'use client'

import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/cn'

const labelVariants = cva('flex font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50')

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>) {
  return <LabelPrimitive.Root data-slot='label' className={cn(labelVariants(), className)} {...props} />
}

export { Label }
