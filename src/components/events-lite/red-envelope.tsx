import type { RedEnvelopeResult, RedEnvelopeStart } from '@laplace.live/event-types'

/**
 * Lite red-envelope-start content: "送了红包" + the reward-pool gift icons
 * with counts. Pool amount lives in the row's shared value slot.
 */
export function RedEnvelopeStartLite({ data }: { data: RedEnvelopeStart }) {
  return (
    <span className='inline-flex flex-wrap items-center gap-1'>
      <span>送了红包</span>
      {data.list?.map(item => (
        <span key={item.gift_id} className='inline-flex items-center gap-0.5'>
          <picture className='inline-flex size-4 shrink-0'>
            <img
              src={item.gift_pic}
              alt={item.gift_name}
              title={item.gift_name}
              className='size-4 object-contain'
              referrerPolicy='no-referrer'
              loading='lazy'
            />
          </picture>
          <span className='text-fg/60'>×{item.num}</span>
        </span>
      ))}
    </span>
  )
}

/**
 * Lite red-envelope-result content: the result message + winner count. Winner
 * avatars are omitted — they are other users, not the history user.
 */
export function RedEnvelopeResultLite({ data }: { data: RedEnvelopeResult }) {
  const total = data.list?.length ?? 0
  return (
    <span>
      {data.message}
      {total > 0 ? `（共 ${total} 人）` : ''}
    </span>
  )
}
