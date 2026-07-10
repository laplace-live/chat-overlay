import type { LaplaceEvent } from '@laplace.live/event-types'

/**
 * Compact one-line text summary for event types without a dedicated lite renderer (like-click, mvp, live-cutoff, …).
 * Moved verbatim from `user-history-submenu.tsx` so the lite system owns all content logic.
 */
export function summarizeEvent(event: LaplaceEvent): string {
  switch (event.type) {
    case 'message':
      return event.message || ''
    case 'superchat':
      return event.message || ''
    case 'gift':
      return `${event.giftAction || ''} ${event.giftName}${event.giftAmount > 1 ? ` × ${event.giftAmount}` : ''}`.trim()
    case 'toast':
      return event.message || event.toastName || ''
    case 'interaction':
      return ''
    case 'like-click':
      return ''
    default:
      return 'message' in event && typeof event.message === 'string' ? event.message : event.type
  }
}

/**
 * Fallback lite renderer: the plain text summary, or an em dash when there is
 * nothing meaningful to show (keeps the row height stable).
 */
export function EventLiteSummary({ data }: { data: LaplaceEvent }) {
  const summary = summarizeEvent(data)
  return summary ? summary : <span className='text-fg/40'>—</span>
}
