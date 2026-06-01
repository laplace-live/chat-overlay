'use client'

import { IconCheck, IconChevronRight, IconCircleFilled } from '@tabler/icons-react'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/cn'

function DropdownMenu({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot='dropdown-menu' {...props} />
}

function DropdownMenuPortal({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal data-slot='dropdown-menu-portal' {...props} />
}

function DropdownMenuTrigger({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot='dropdown-menu-trigger' {...props} />
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot='dropdown-menu-content'
        sideOffset={sideOffset}
        className={cn(
          'floating min-w-32 overflow-y-auto overflow-x-hidden rounded-md border px-0 py-1 text-fg',
          // max size config
          'max-h-(--radix-dropdown-menu-content-available-height) max-w-(--radix-dropdown-menu-content-available-width)',
          // copied from shadcn
          'data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-closed:animate-out',
          className
        )}
        collisionPadding={5}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot='dropdown-menu-group' {...props} />
}

function DropdownMenuItem({
  className,
  inset,
  tint = 'accent',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  tint?: 'accent' | 'rose'
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot='dropdown-menu-item'
      data-inset={inset}
      data-tint={tint}
      className={cn(
        'relative flex cursor-default select-none gap-1.5 px-3 py-1.5 font-normal text-sm outline-hidden focus:bg-ac/10 focus:text-ac data-disabled:pointer-events-none data-inset:pl-8 data-disabled:opacity-50',

        // Icon
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:mt-0.5 [&_svg]:-ml-0.5 [&_svg]:shrink-0",

        // Tint Rose
        // Mapped to shadcn variant=destructive
        'data-[tint=rose]:text-rose-500 data-[tint=rose]:focus:bg-rose-500/10 data-[tint=rose]:focus:text-rose-500 data-[tint=rose]:*:[svg]:text-rose-500!',
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  hideIndicator,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
  hideIndicator?: boolean
}) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot='dropdown-menu-checkbox-item'
      className={cn(
        'relative flex cursor-default select-none gap-1.5 py-1.5 pr-3 pl-8 text-sm outline-hidden focus:bg-ac/10 focus:text-ac data-disabled:pointer-events-none data-disabled:opacity-50',

        // Icon
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:mt-0.5 [&_svg]:-ml-0.5 [&_svg]:shrink-0",

        hideIndicator && 'pl-3 data-checked:text-ac',

        className
      )}
      checked={checked}
      {...props}
    >
      {!hideIndicator && (
        <DropdownMenuPrimitive.ItemIndicator className='pointer-events-none absolute top-1.5 left-2.5 flex size-4 justify-center'>
          <IconCheck className='size-4' />
        </DropdownMenuPrimitive.ItemIndicator>
      )}
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return <DropdownMenuPrimitive.RadioGroup data-slot='dropdown-menu-radio-group' {...props} />
}

function DropdownMenuRadioItem({
  className,
  children,
  hideIndicator,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  hideIndicator?: boolean
}) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot='dropdown-menu-radio-item'
      className={cn(
        'relative flex cursor-default select-none gap-1.5 py-1.5 pr-3 pl-8 text-sm outline-hidden focus:bg-ac/10 focus:text-ac data-disabled:pointer-events-none data-disabled:opacity-50',

        // Icon
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:mt-0.5 [&_svg]:-ml-0.5 [&_svg]:shrink-0",

        hideIndicator && 'pl-3 data-checked:text-ac',
        className
      )}
      {...props}
    >
      {!hideIndicator && (
        <DropdownMenuPrimitive.ItemIndicator className='pointer-events-none absolute top-2.5 left-2.5 flex size-4 justify-center'>
          <IconCircleFilled className='size-2' />
        </DropdownMenuPrimitive.ItemIndicator>
      )}
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot='dropdown-menu-label'
      data-inset={inset}
      className={cn('px-3 py-1.5 text-fg/60 text-xs uppercase leading-none data-inset:pl-8', className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot='dropdown-menu-separator'
      className={cn('-mx-1 h-1 bg-fg/5', className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='dropdown-menu-shortcut'
      className={cn('mt-0.5 ml-auto text-xs tracking-widest opacity-60', className)}
      {...props}
    />
  )
}

function DropdownMenuSub({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot='dropdown-menu-sub' {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot='dropdown-menu-sub-trigger'
      data-inset={inset}
      className={cn(
        'flex cursor-default select-none gap-1.5 px-3 py-1.5 text-sm outline-hidden focus:bg-ac/10 focus:text-ac data-inset:pl-8',
        'data-open:bg-fg/5',
        'data-open:data-[highlighted]:bg-ac/10 data-open:data-[highlighted]:text-ac',

        // Icon
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:mt-0.5 [&_svg]:shrink-0",
        "[&_svg:not([data-slot='dropdown-menu-sub-trigger-icon'])]:-ml-0.5",
        className
      )}
      {...props}
    >
      {children}
      <IconChevronRight data-slot='dropdown-menu-sub-trigger-icon' className='ml-auto size-4' />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  sideOffset = -4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        data-slot='dropdown-menu-sub-content'
        sideOffset={sideOffset}
        className={cn(
          'floating min-w-32 overflow-hidden rounded-md border px-0 py-1 text-fg',
          'data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-closed:animate-out',

          // max size config
          'max-h-(--radix-dropdown-menu-content-available-height) max-w-(--radix-dropdown-menu-content-available-width) overflow-y-auto',

          'origin-(--radix-dropdown-menu-content-transform-origin)',
          className
        )}
        collisionPadding={5}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
}
