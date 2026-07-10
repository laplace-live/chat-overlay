import type { EntryEffect } from '@laplace.live/event-types'

/**
 * Static "来了" — the full effect's text/colors assume an animated background and would be illegible here.
 * `data` is unused but kept so every lite renderer shares the same `{ data }` signature for `EventLite`.
 */
export function EntryEffectLite(_props: { data: EntryEffect }) {
  return <span className='text-fg/60'>来了</span>
}
