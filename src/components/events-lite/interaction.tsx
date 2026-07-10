import type { Interaction } from '@laplace.live/event-types'

import { interactionCopywriting } from '@/utils/event-copywriting'

/** Action copywriting ("关注/进入/分享…直播间") plus relation icon; mirrors `interaction.tsx` without avatar/username chrome. */
export function InteractionLite({ data }: { data: Interaction }) {
  const { name } = interactionCopywriting(data.action)
  const relation = data.relation

  return (
    <span className='inline-flex items-center gap-1'>
      <span className='text-fg/60'>{name}直播间</span>
      {relation && relation.type > 0 && relation.icon ? (
        <picture className='inline-flex h-4 shrink-0'>
          <img
            src={relation.icon}
            alt={relation.text}
            title={relation.text}
            className='h-4'
            referrerPolicy='no-referrer'
            loading='lazy'
          />
        </picture>
      ) : null}
    </span>
  )
}
