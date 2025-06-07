import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

import { nf } from './numberFormat'

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
    <span className={clsx(className, isAnimating && (isIncreasing ? 'green' : 'red'), 'animated-numbers')}>
      {nf.format(value)}
    </span>
  )
}

export default AnimatedNumber
