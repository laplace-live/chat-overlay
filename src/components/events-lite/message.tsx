import type { Message } from '@laplace.live/event-types'

import { BmoteRenderer } from '@/components/event-primitives/bmote-renderer'
import { EmoteRenderer } from '@/components/event-primitives/emote-renderer'

/**
 * Lite danmaku content. Same emote priority as `danmaku.tsx` / `dashboard-card-mode-item.tsx`.
 * No identity/reply chrome/translation/`remoteEmotes` merge here — single-user history list doesn't need them.
 */
export function MessageLite({ data }: { data: Message }) {
  const emote = data.emote
  if (emote && 'url' in emote) {
    return <EmoteRenderer emote={emote} />
  }

  const message = data.message
  if (!message) {
    return <span className='text-fg/40'>—</span>
  }

  const bmotes = data.bmotes
  if (bmotes && Object.keys(bmotes).length > 0) {
    return <BmoteRenderer text={message} bmotes={bmotes} />
  }

  return message
}
