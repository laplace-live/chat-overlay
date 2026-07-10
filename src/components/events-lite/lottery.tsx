import type { LotteryResult, LotteryStart } from '@laplace.live/event-types'

/**
 * Lite 天选时刻 (lottery) start content: the reward name. Join requirements
 * and gift cost are dropped to keep the row compact.
 */
export function LotteryStartLite({ data }: { data: LotteryStart }) {
  return <span>天选时刻{data.rewardName ? `：${data.rewardName}` : ''}</span>
}

/**
 * Lite lottery-result content: the result message + winner count. Winner
 * avatars are omitted — they are other users, not the history user.
 */
export function LotteryResultLite({ data }: { data: LotteryResult }) {
  const total = data.list?.length ?? 0
  return (
    <span>
      {data.message}
      {total > 0 ? `（共 ${total} 人）` : ''}
    </span>
  )
}
