import { useEffect, useRef, useState } from 'react'

import { nf } from './numberFormat'
import { cn } from '../lib/cn'

const AnimatedNumber = ({ value, className = '' }: { value: number; className?: string }) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isIncreasing, setIsIncreasing] = useState(false)
  const prevValueRef = useRef(value)

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setIsAnimating(true)
      setIsIncreasing(value > prevValueRef.current)

      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 1000)

      prevValueRef.current = value
      return () => clearTimeout(timer)
    }
  }, [value])

  return (
    <span
      className={cn(
        className,
        isAnimating && (isIncreasing ? 'text-emerald-300 transition-none' : 'text-rose-300 transition-none'),
        'transition-colors duration-1000'
      )}
    >
      {nf.format(value)}
    </span>
  )
}

export default AnimatedNumber
