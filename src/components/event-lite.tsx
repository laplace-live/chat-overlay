import type { LaplaceEvent } from '@laplace.live/event-types'

import { EntryEffectLite } from '@/components/events-lite/entry-effect'
import { GiftLite } from '@/components/events-lite/gift'
import { InteractionLite } from '@/components/events-lite/interaction'
import { LotteryResultLite, LotteryStartLite } from '@/components/events-lite/lottery'
import { MessageLite } from '@/components/events-lite/message'
import { RedEnvelopeResultLite, RedEnvelopeStartLite } from '@/components/events-lite/red-envelope'
import { EventLiteSummary } from '@/components/events-lite/summary'
import { SuperChatLite } from '@/components/events-lite/superchat'
import { ToastLite } from '@/components/events-lite/toast'

/**
 * Content-only sibling to `event.tsx` for compact, single-user contexts: dispatches by event
 * type to a "lite" renderer showing enriched content but no identity/row chrome (consumer owns
 * time/room/price/jump). Falls back to a plain text summary for types without a dedicated renderer.
 */
export function EventLite({ data }: { data: LaplaceEvent }) {
  switch (data.type) {
    case 'message':
      return <MessageLite data={data} />
    case 'superchat':
      return <SuperChatLite data={data} />
    case 'gift':
      return <GiftLite data={data} />
    case 'toast':
      return <ToastLite data={data} />
    case 'interaction':
      return <InteractionLite data={data} />
    case 'entry-effect':
      return <EntryEffectLite data={data} />
    case 'red-envelope-start':
      return <RedEnvelopeStartLite data={data} />
    case 'red-envelope-result':
      return <RedEnvelopeResultLite data={data} />
    case 'lottery-start':
      return <LotteryStartLite data={data} />
    case 'lottery-result':
      return <LotteryResultLite data={data} />
    default:
      return <EventLiteSummary data={data} />
  }
}
