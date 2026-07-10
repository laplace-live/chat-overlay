import type { Toast } from '@laplace.live/event-types'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/cn'

import { toastCopywriting } from '@/utils/event-copywriting'

/** Soft guard-tier tints for 大航海 events, keyed by `toastType`; matches the canonical palette in `guard-tailwind-tint.ts`. */
const toastTierTintVariants = cva('', {
  variants: {
    tier: {
      1: 'bg-rose-500/25', // 总督
      2: 'bg-purple-500/25', // 提督
      3: 'bg-sky-500/25', // 舰长
    },
  },
})

/** Lite 大航海 (guard purchase) content: action + tier + amount + accompany days, in a guard-tier-tinted bubble; price lives in the row's shared value slot. */
export function ToastLite({ data }: { data: Toast }) {
  const { totalDays, toastActionType } = toastCopywriting(data.message)
  // 盲盒把数量写进了单位里，这里把数字抠出来（与 `toast.tsx` 一致）
  const blindToastUnit = data.toastAmountUnit.match(/\d+/)
  // toastType is a wide number; default to 舰长 (3) outside the guard tiers
  const tier = data.toastType === 1 || data.toastType === 2 ? data.toastType : 3
  const tint = toastTierTintVariants({ tier })

  return (
    <div className={cn('rounded px-1.5 py-0.5', tint)}>
      {toastActionType}
      {data.toastName}
      {data.toastAmount > 1
        ? ` ×${data.toastAmount}${data.toastAmountUnit === '月' ? `个${data.toastAmountUnit}` : data.toastAmountUnit}`
        : ''}
      {data.toastAmountUnit.includes('天') ? ` ×${blindToastUnit ? blindToastUnit[0] : 1}天` : ''}
      {totalDays > 0 ? `，已陪伴主播 ${totalDays} 天` : ''}
    </div>
  )
}
