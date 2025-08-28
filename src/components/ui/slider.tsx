'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'
import { IconRestore } from '@tabler/icons-react'
import * as React from 'react'

import { cn } from '../../lib/cn'

interface Mark {
  value: number
  label: string
}

interface SliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  /** Default value for reset functionality */
  defaultValues?: Mark[]
  marks?: Mark[]
  trackProps?: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Track>
  rangeProps?: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Range>
}

function Slider({
  className,
  marks,
  defaultValues,
  min,
  max,
  value,
  onValueChange,
  trackProps,
  rangeProps,
  ...props
}: SliderProps) {
  const [hoveredThumb, setHoveredThumb] = React.useState<number | null>(null)

  const { className: trackClassName, ...restTrackProps } = trackProps || {}
  const { className: rangeClassName, ...restRangeProps } = rangeProps || {}
  // Calculate mark position as a percentage
  const getMarkPosition = (value: number) => {
    if (typeof min !== 'number' || typeof max !== 'number') return '0%'
    return `${((value - min) / (max - min)) * 100}%`
  }

  // Check if a mark is within the selected range
  const isMarkInRange = (mark: number) => {
    if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
      const [start, end] = value
      return mark >= start && mark <= end
    }
    if (Array.isArray(value) && value.length === 1 && typeof value[0] === 'number') {
      return mark <= value[0]
    }
    return false
  }

  // Handle label click
  const handleLabelClick = (clickedValue: number) => {
    if (!onValueChange) return

    // Handle range slider (array of 2 values)
    if (Array.isArray(value) && value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
      const [start, end] = value
      // Determine which thumb to move based on which is closer to the clicked value
      const distanceToStart = Math.abs(clickedValue - start)
      const distanceToEnd = Math.abs(clickedValue - end)

      if (distanceToStart <= distanceToEnd) {
        onValueChange([clickedValue, end])
      } else {
        onValueChange([start, clickedValue])
      }
    }
    // Handle single value slider
    else if (typeof onValueChange === 'function') {
      onValueChange([clickedValue])
    }
  }

  return (
    <div className={cn('relative flex w-full flex-col', (marks || defaultValues) && 'pb-4')}>
      <SliderPrimitive.Root
        data-slot='slider'
        min={min}
        max={max}
        value={value}
        onValueChange={onValueChange}
        className={cn(
          'relative my-2 flex w-full touch-none items-center select-none',
          props.disabled && 'pointer-events-none opacity-60',
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn('bg-fg/10 relative h-2 w-full grow overflow-hidden rounded-full', trackClassName)}
          {...restTrackProps}
        >
          <SliderPrimitive.Range className={cn('bg-ac absolute h-full', rangeClassName)} {...restRangeProps} />

          {/* Render marks */}
          {marks ? (
            <div className='pointer-events-none absolute top-1/2 right-2 left-2 -translate-y-1/2'>
              {marks.map(({ value: mark }, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full',
                    isMarkInRange(mark) ? 'bg-bg' : 'bg-fg/40'
                  )}
                  style={{ left: getMarkPosition(mark) }}
                />
              ))}
            </div>
          ) : null}

          {/* Render default values */}
          {defaultValues ? (
            <div className='pointer-events-none absolute top-1/2 right-2 left-2 -translate-y-1/2'>
              {defaultValues.map(({ value: mark }, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'absolute top-1/2 h-1.5 w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-[1px]',
                    isMarkInRange(mark) ? 'bg-bg' : 'bg-fg/40'
                  )}
                  style={{ left: getMarkPosition(mark) }}
                />
              ))}
            </div>
          ) : null}
        </SliderPrimitive.Track>

        {/* Render thumbs with tooltips */}
        {Array.isArray(value) &&
          value.map((thumbValue, idx) => (
            <SliderPrimitive.Thumb
              key={idx}
              onMouseEnter={() => setHoveredThumb(idx)}
              onMouseLeave={() => setHoveredThumb(null)}
              className='border-ac bg-bg ring-offset-bg focus-ring block size-4 cursor-pointer rounded-full border-[.325rem] transition-colors disabled:pointer-events-none disabled:opacity-50'
            >
              {/* NOTE: nested backdrop filter blur does not work */}
              <div
                className={cn(
                  'floating pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-sm px-2 py-1.5 opacity-0 transition-opacity',
                  hoveredThumb === idx && 'opacity-100 duration-0'
                )}
              >
                {thumbValue}
              </div>
            </SliderPrimitive.Thumb>
          ))}
      </SliderPrimitive.Root>

      {/* Render labels */}
      {marks && (
        <div
          className={cn(
            'absolute top-7 right-2 left-2 -mt-1.5 mb-2',
            props.disabled && 'pointer-events-none opacity-60'
          )}
        >
          {marks.map(({ value: mark, label }, idx) => (
            <button
              key={idx}
              type='button'
              className={cn(
                'hover:text-fg absolute flex cursor-pointer text-xs text-nowrap select-none',
                isMarkInRange(mark) ? 'text-fg' : 'text-fg/40'
              )}
              style={{
                left: getMarkPosition(mark),
                translate: '-50%',
              }}
              onClick={() => handleLabelClick(mark)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Render default values */}
      {defaultValues && (
        <div
          className={cn(
            'absolute top-7 right-2 left-2 -mt-1.5 mb-2',
            props.disabled && 'pointer-events-none opacity-60'
          )}
        >
          {defaultValues.map(({ value: mark }, idx) => (
            <button
              key={idx}
              type='button'
              className={cn(
                'hover:text-fg absolute flex cursor-pointer text-xs text-nowrap select-none',
                value && mark !== value[0] ? 'text-fg' : 'text-fg/40'
              )}
              style={{
                left: getMarkPosition(mark),
                translate: '-50%',
              }}
              onClick={() => handleLabelClick(mark)}
            >
              {value && mark !== value[0] ? <IconRestore className='size-4' /> : value}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export { Slider }
export type { Mark }
