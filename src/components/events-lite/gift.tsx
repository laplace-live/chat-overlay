import type { Gift } from '@laplace.live/event-types'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/cn'

import { getGiftRank } from '@/utils/get-gift-rank'
import { nf } from '@/utils/number-format'

/** Subtle price-tier wash for paid (金瓜子) gifts, keyed by `getGiftRank` ('1'–'6'); mirrors superchat lite's tier palette. */
const giftTierTintVariants = cva('', {
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
 * Lite gift content: icon + name + count in a subtle price-tier wash; price lives in the row's shared value slot.
 * Icon URL mirrors `gift.tsx`'s gift-config endpoint but at a small fixed size (row never highlights).
 */
export function GiftLite({ data }: { data: Gift }) {
  const name = data.message || data.giftName
  // getGiftRank is a ¥ scale, so only paid (金瓜子) gifts get a price-tier wash
  const isPaid = data.coinType === 'gold'
  const price = data.blindGift ? (data.blindGift.gift_tip_price * data.giftAmount) / 1000 : data.priceNormalized
  const tint = isPaid ? cn('rounded px-1.5 py-0.5', giftTierTintVariants({ tier: getGiftRank(price) })) : ''

  return (
    <span className={cn('inline-flex items-center gap-1', tint)}>
      {data.giftIcon ? (
        <picture className='inline-flex shrink-0'>
          <img
            src={data.giftIcon}
            alt=''
            className='size-4 object-contain'
            referrerPolicy='no-referrer'
            loading='lazy'
          />
        </picture>
      ) : null}
      <span className='min-w-0'>{name}</span>
      {data.giftAmount > 1 && <span className='shrink-0 text-fg/60'>×{nf.format(data.giftAmount)}</span>}
    </span>
  )
}
