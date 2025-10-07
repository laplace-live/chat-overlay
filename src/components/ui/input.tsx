import { IconAdjustments, IconAdjustmentsCog, IconChevronDown, IconChevronUp, IconRestore } from '@tabler/icons-react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/cn'

import { Button } from './button'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

const inputVariants = cva(
  [
    'flex w-full appearance-none rounded-sm border bg-transparent',
    'text-fg inset-shadow-input outline-hidden file:border-0 file:bg-transparent file:font-medium file:text-fg placeholder:text-fg/40',
    'focus-ring hover:focus-visible:border-ac',
    'disabled:cursor-not-allowed disabled:border-fg/30 disabled:opacity-50 disabled:bg-fg/5',
    // Hide native spinner buttons
    '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
  ],
  {
    variants: {
      inputSize: {
        sm: 'px-2 py-[calc(0.25rem-1px)] text-xs',
        md: 'px-2.5 py-[calc(0.25rem-1px)] text-base rounded-md',
        lg: 'px-3 py-[calc(0.25rem-1px)] text-lg rounded-md',
      },
    },
    defaultVariants: {
      inputSize: 'md',
    },
  }
)

export interface InputProps extends React.ComponentProps<'input'>, VariantProps<typeof inputVariants> {
  /** Custom property for future use */
  customProp?: string
  leftSection?: React.ReactNode
  rightSection?: React.ReactNode
  /** className for leftSection wrap */
  leftSectionClassName?: string
  /** className for rightSection wrap */
  rightSectionClassName?: string
  error?: React.ReactNode
  /** Hide number controls for number inputs */
  hideControls?: boolean
  /** Step interval for number inputs */
  step?: number
  /** Min value for number inputs */
  min?: number
  /** Max value for number inputs */
  max?: number
}

function Input({
  className,
  type,
  leftSection,
  leftSectionClassName,
  rightSection,
  rightSectionClassName,
  error,
  inputSize,
  hideControls,
  step = 1,
  min,
  max,
  onChange,
  disabled,
  value,
  defaultValue,
  ...props
}: InputProps) {
  const triggerChange = (newValue: number) => {
    if (disabled) return

    if (onChange) {
      onChange({
        target: { value: newValue.toString(), valueAsNumber: newValue },
        currentTarget: { value: newValue.toString(), valueAsNumber: newValue },
      } as React.ChangeEvent<HTMLInputElement>)
    }
  }

  const handleIncrement = () => {
    if (disabled) return

    const currentValue = Number(value) || 0
    const newValue = currentValue + step

    if (max !== undefined && newValue > max) return

    triggerChange(newValue)
  }

  const handleDecrement = () => {
    if (disabled) return

    const currentValue = Number(value) || 0
    const newValue = currentValue - step

    if (min !== undefined && newValue < min) return

    triggerChange(newValue)
  }

  const handleReset = () => {
    if (disabled || defaultValue === undefined) return
    triggerChange(Number(defaultValue))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (type !== 'number') return
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleIncrement()
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      handleDecrement()
    }
  }

  const isValueDifferentFromDefault = defaultValue !== undefined && Number(value) !== defaultValue

  const numberControls = type === 'number' && !hideControls && (
    <div className='flex gap-0.5 p-0.5'>
      <div className='flex gap-0.5'>
        <Button
          variant={'link'}
          className='size-8 p-0'
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && Number(value) >= max)}
          aria-label='Increment'
        >
          <IconChevronUp size='1rem' />
        </Button>
        <Button
          variant={'link'}
          className='size-8 p-0'
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && Number(value) <= min)}
          aria-label='Decrement'
        >
          <IconChevronDown size='1rem' />
        </Button>
      </div>
      {defaultValue !== undefined && (
        <Button
          variant={'link'}
          className='size-8 p-0'
          onClick={handleReset}
          disabled={disabled || Number(value) === defaultValue}
          aria-label='Reset to default'
        >
          <IconRestore size='1rem' />
        </Button>
      )}
    </div>
  )

  const resolvedProps = (inputSize: InputProps['inputSize']) => {
    switch (inputSize) {
      case 'sm':
        return { buttonMargin: 'p-0 mr-1.25', iconSize: '0.75rem' }
      case 'lg':
        return { buttonMargin: 'p-0.25 mr-1.5', iconSize: '1.25rem' }
      default:
        return { buttonMargin: 'p-0.25 mr-1.5', iconSize: '1rem' }
    }
  }

  return (
    <div className='group/input-wrap'>
      <div className='group/input relative'>
        {leftSection ? (
          <div className={cn('absolute top-0 bottom-0 left-0 flex items-center justify-center', leftSectionClassName)}>
            {leftSection}
          </div>
        ) : null}
        <input
          type={type}
          data-slot='input'
          className={cn(
            inputVariants({ inputSize }),
            error && 'border-rose-500! text-rose-500 focus-visible:ring-rose-500/30',
            leftSection && 'pl-[2em]',
            (rightSection || type === 'number') && 'pr-[2em]',
            className
          )}
          onKeyDown={handleKeyDown}
          onChange={onChange}
          disabled={disabled}
          value={value}
          min={min}
          max={max}
          step={step}
          ref={props.ref}
          defaultValue={defaultValue}
          {...props}
        />
        {rightSection || (type === 'number' && !hideControls) ? (
          <div
            className={cn('absolute top-0 right-0 bottom-0 flex items-center justify-center', rightSectionClassName)}
          >
            {rightSection || (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size='sm'
                    variant={'link'}
                    className={cn(resolvedProps(inputSize).buttonMargin)}
                    disabled={disabled}
                  >
                    {isValueDifferentFromDefault ? (
                      <IconAdjustmentsCog size={resolvedProps(inputSize).iconSize} className='text-blue-500' />
                    ) : (
                      <IconAdjustments size={resolvedProps(inputSize).iconSize} />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-fit p-0' side='top'>
                  {numberControls}
                </PopoverContent>
              </Popover>
            )}
          </div>
        ) : null}
      </div>
      {error && typeof error !== 'boolean' ? <div className='text-sm text-rose-500'>{error}</div> : null}
    </div>
  )
}

export { Input }
