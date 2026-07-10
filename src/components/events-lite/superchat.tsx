import type { SuperChat } from '@laplace.live/event-types'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/cn'

import { getGiftRank } from '@/utils/get-gift-rank'

/**
 * Soft price-tier tints evoking superchat color brackets without the heavy `superchat.css` styling.
 * Keyed by `getGiftRank` ('1'–'6'); mirrors the shared `Badge` tint style.
 */
const scTierTintVariants = cva('', {
  variants: {
    tier: {
      '1': 'bg-blue-500/25',
      '2': 'bg-green-500/25',
      '3': 'bg-yellow-500/25',
      '4': 'bg-orange-500/25',
      '5': 'bg-red-500/25',
      '6': 'bg-rose-500/25',
    },
  },
})

/**
 * Lite superchat content: the message in a price-tinted bubble. Price lives
 * in the row's shared value slot, so it is not repeated here.
 */
export function SuperChatLite({ data }: { data: SuperChat }) {
  const tint = scTierTintVariants({ tier: getGiftRank(data.priceNormalized) })

  if (!data.message) {
    return <div className='text-fg/40'>—</div>
  }

  return (
    <div className={cn('rounded px-1.5 py-0.5', tint, data.priceNormalized < 30 && 'opacity-60')}>{data.message}</div>
  )
}
