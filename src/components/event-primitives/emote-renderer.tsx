import type { BilibiliInternal } from '@laplace.live/internal'
import { clsx } from 'clsx'

interface EmoteRendererProps {
  emote: BilibiliInternal.WebSocket.Prod.EmoteProps
}

/**
 * 直播间表情渲染器
 *
 * 此处的表情不同于b豆表情（{@link BmoteRenderer}），用户只可以输入一个，因此渲染时弹幕消息不会包含任何其他文字内容。
 */
export function EmoteRenderer({ emote }: EmoteRendererProps) {
  const isLarge = Boolean(emote.bulge_display)

  return (
    <picture className={clsx('emote-wrap', isLarge && 'emote-wrap--large')}>
      <img
        className={clsx('emote', isLarge && 'emote--large')}
        src={emote.url}
        alt={emote.emoticon_unique}
        referrerPolicy='no-referrer'
        loading='lazy'
      />
    </picture>
  )
}
